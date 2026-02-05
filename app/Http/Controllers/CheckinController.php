<?php

namespace App\Http\Controllers;

use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerCheckins;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TypeProcessPoint;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckinController extends Controller
{
    // เช็คสถานะว่าวันนี้ Check-in หรือยัง
    public function status()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error'], 401);
        }

        $customer = TblCustomerProd::where('cust_uid', $user->line_id)->first();
        if (!$customer) {
            return response()->json([
                'has_checked_in' => false,
                'current_streak' => 0,
                'checked_days' => []
            ]);
        }

        $today = Carbon::today()->format('Y-m-d');

        // เช็ควันนี้
        $checkinToday = TblCustomerCheckins::where('customer_id', $customer->id)
            ->whereDate('checkin_date', $today)
            ->exists();

        // streak ล่าสุด
        $lastCheckin = TblCustomerCheckins::where('customer_id', $customer->id)
            ->orderBy('checkin_date', 'desc')
            ->first();

        // 👉 ส่งเป็น Y-m-d ทั้งหมดในเดือนนี้
        $checkedDays = TblCustomerCheckins::where('customer_id', $customer->id)
            ->whereBetween('checkin_date', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ])
            ->pluck('checkin_date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->values();

        return response()->json([
            'has_checked_in' => $checkinToday,
            'current_streak' => $lastCheckin?->streak_count ?? 0,
            'checked_days' => $checkedDays
        ]);
    }

    // ทำการ Check-in
    public function store()
    {
        try {
            $user = Auth::user();
            $lineId = $user->line_id ?? null;

            if (!$lineId) return response()->json(['message' => 'ไม่พบข้อมูล LINE ID'], 400);

            $customer = TblCustomerProd::where('cust_uid', $lineId)->first();
            if (!$customer) return response()->json(['message' => 'ไม่พบข้อมูลลูกค้า'], 404);

            $today = Carbon::now()->format('Y-m-d');
            $yesterday = Carbon::yesterday()->format('Y-m-d');

            // 1. ดึงข้อมูล Process Point จาก DB (สำคัญ!)
            // เพื่อเอา default_point มาใช้
            $process = TypeProcessPoint::where('process_code', 'CHECKIN')->first();

            // ถ้าไม่มีใน DB ให้ Default เป็น 10
            $basePoint = $process ? $process->default_point : 10;
            $processName = $process ? $process->process_name : 'Daily Check-in';

            // Double check
            $exists = TblCustomerCheckins::where('customer_id', $customer->id)
                ->where('checkin_date', $today)
                ->exists();

            if ($exists) {
                return response()->json(['message' => 'วันนี้คุณ Check-in ไปแล้ว'], 400);
            }

            DB::connection('mysql_slip')->beginTransaction();

            // 2. คำนวณ Streak
            $lastCheckin = TblCustomerCheckins::where('customer_id', $customer->id)
                ->orderBy('checkin_date', 'desc')
                ->first();
            $streak = 1;
            if ($lastCheckin && $lastCheckin->checkin_date) {
                // ใช้ format() เพื่อเปรียบเทียบ String วันที่ให้ชัดเจน
                $lastDate = $lastCheckin->checkin_date->format('Y-m-d');

                if ($lastDate === $yesterday) {
                    $streak = (int)$lastCheckin->streak_count + 1;
                }
            }

            // 3. คำนวณแต้ม (ใช้ basePoint จาก DB)
            $points = $basePoint; // เริ่มต้นด้วยค่าจาก DB (เช่น 10)
            $isBonus = false;

            if ($streak == 10) {
                $points = 50; // เช็คอินครบ 10 วันต่อเนื่อง
                $isBonus = true;
            } else if ($streak == 20) {
                $points = 100; // เช็คอินครบ 20 วันต่อเนื่อง
                $isBonus = true;
            } else if ($streak % 7 == 0) {
                $points = $basePoint * 3; // โบนัสรายสัปดาห์ปกติ
                $isBonus = true;
            }

            // เตรียมข้อมูล Point Transaction
            $pointBefore = (int) ($customer->point ?? 0);
            $pointTran   = $points;
            $pointAfter  = $pointBefore + $pointTran;

            // 4. บันทึก Log การ Check-in
            TblCustomerCheckins::create([
                'customer_id'  => $customer->id,
                'checkin_date' => $today,
                'checkin_at'   => Carbon::now(),
                'streak_count' => $streak,
                'reward_point' => $points
            ]);

            // 5. อัปเดตแต้มลูกค้า
            $customer->point = $pointAfter;
            $customer->last_earn_at = Carbon::now();
            $customer->save();

            // 6. บันทึก Point Transaction 
            $txnName = $processName;
            if ($streak == 10 || $streak == 20) {
                $txnName = "Milestone Reward: Consecutive {$streak} Days!";
            } else if ($isBonus) {
                $txnName .= " (Weekly Bonus)";
            }

            PointTransaction::create([
                'line_id'          => $lineId,
                'transaction_type' => 'earn',
                'process_code'     => 'CHECKIN',
                'reference_id'     => uniqid('CHK-'),
                'pid'              => null,
                'pname'            => $txnName,
                'product_type'     => 'privilege',
                'point_before'     => $pointBefore,
                'point_tran'       => $pointTran,
                'point_after'      => $pointAfter,
                'tier'             => $customer->tier_key,
                'docdate'          => $today,
                'docno'            => 'CHK-' . Carbon::now()->format('YmdHis') . '-' . $customer->id,
                'trandate'         => $today,
                'created_at'       => Carbon::now(),
                'expired_at'       => Carbon::now()->addYears(2),
            ]);

            DB::connection('mysql_slip')->commit();

            return response()->json([
                'status'   => 'success',
                'points'   => $points,
                'streak'   => $streak,
                'is_bonus' => $isBonus,
                'message'  => 'Check-in สำเร็จ!'
            ]);
        } catch (\Exception $e) {
            DB::connection('mysql_slip')->rollBack();
            Log::error("Checkin Error: " . $e->getMessage());
            return response()->json(['message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()], 500);
        }
    }
}
