<?php

namespace App\Http\Controllers\Privilege;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\MembershipTier;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\ProductTier;
use App\Models\MasterWaaranty\RedeemHistory;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TypeProcessPoint;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RedeemController extends Controller
{
    // public function store(Request $request)
    // {
    //     $request->validate([
    //         'pid' => 'required|string',
    //         'pname' => 'required|string',
    //         'redeem_point' => 'required|integer|min:1',
    //     ]);

    //     $user = Auth::user();

    //     DB::beginTransaction();
    //     try {
    //         $customer = TblCustomerProd::where('cust_line', $user->line_id)->firstOrFail();

    //         // ✅ ตรวจสอบแต้มจากฟิลด์ point
    //         if ($customer->point < $request->redeem_point) {
    //             return response()->json(['success' => false, 'message' => 'คะแนนไม่พอ'], 400);
    //         }

    //         $pointBefore = $customer->point;
    //         $pointAfter  = $pointBefore - $request->redeem_point;

    //         // ✅ เช็คว่าระดับ Tier หมดอายุหรือยัง
    //         $now = Carbon::now();
    //         $isExpired = !$customer->tier_expired_at || $now->greaterThan(Carbon::parse($customer->tier_expired_at));

    //         if ($isExpired) {
    //             // ถ้าหมดอายุแล้ว → คำนวณ Tier ใหม่จากคะแนนปัจจุบัน
    //             $tierKey = match (true) {
    //                 $pointAfter >= 3000 => 'platinum',
    //                 $pointAfter >= 1000 => 'gold',
    //                 default             => 'silver',
    //             };

    //             // ต่ออายุ Tier ใหม่อีก 2 ปี
    //             $tierExpiredAt = $now->copy()->addYears(2);
    //         } else {
    //             // ถ้ายังไม่หมดอายุ → ใช้ Tier เดิมต่อไป
    //             $tierKey = $customer->tier_key;
    //             $tierExpiredAt = $customer->tier_expired_at;
    //         }

    //         // ดึงประเภทสินค้า
    //         $product = ProductTier::where('is_active', 1)
    //             ->where('pid', $request->pid)
    //             ->select('product_type')
    //             ->first();

    //         $productType = $product?->product_type ?? 'reward';

    //         Log::info('🎁 Product Query', [
    //             'pid' => $request->pid,
    //             'found' => $product,
    //         ]);

    //         // ดึง process_code จาก type_process_points (ใช้ REDEEM)
    //         $process = TypeProcessPoint::where('transaction_type', 'redeem')
    //             ->where('process_code', 'REDEEM')
    //             ->where('is_active', 1)
    //             ->first();

    //         $processCode = $process?->process_code ?? 'REDEEM';

    //         // อัปเดตคะแนนและ Tier ลูกค้า
    //         $customer->update([
    //             'point'           => $pointAfter,
    //             'tier_key'        => $tierKey,
    //             'tier_updated_at' => $now,
    //             'tier_expired_at' => $tierExpiredAt,
    //             'last_redeem_at'  => $now,
    //         ]);

    //         // ✅ บันทึกธุรกรรม
    //         $transaction = PointTransaction::create([
    //             'line_id'           => $user->line_id,
    //             'transaction_type'  => 'redeem',
    //             'reference_id'      => uniqid('TXN-'),
    //             'pid'               => $request->pid,
    //             'pname'             => $request->pname,
    //             'product_type'      => $productType,
    //             'process_code'      => $processCode,
    //             'point_before'      => $pointBefore,
    //             'point_tran'        => -$request->redeem_point,
    //             'point_after'       => $pointAfter,
    //             'tier'              => $tierKey,
    //             'docdate'           => $now->toDateString(),
    //             // 'docno'             => 'RDM-' . $now->format('YmdHis'),
    //             'docno'             => sprintf('RDM-%05d-%s', $customer->id, $now->format('YmdHis')),
    //             'trandate'          => $now->toDateString(),
    //             'created_at'        => $now,
    //             'expired_at'        => $now->copy()->addYears(2)->toDateString(),
    //         ]);

    //         DB::commit();

    //         return response()->json([
    //             'success'   => true,
    //             'message'   => 'แลกรางวัลสำเร็จ 🎁',
    //             'new_point' => $pointAfter,
    //             'new_tier'  => $tierKey,
    //             'tier_expired_at' => $tierExpiredAt,
    //             'transaction' => $transaction,
    //         ]);
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         Log::error('Redeem error', ['error' => $e->getMessage()]);
    //         return response()->json(['success' => false, 'message' => 'เกิดข้อผิดพลาดในการแลก'], 500);
    //     }
    // }

    // //โชว์หน้าประวัติการแลกของรางวัล
    // public function history()
    // {
    //     $user = Auth::user();

    //     $histories = PointTransaction::where('line_id', $user->line_id)
    //         ->orderByDesc('trandate')
    //         ->get([
    //             'pid',
    //             'pname',
    //             'point_tran',
    //             'trandate',
    //             'point_before',
    //             'point_after',
    //             'tier',
    //             'transaction_type',
    //             'process_code'
    //         ]);

    //     return response()->json(['data' => $histories]);
    // }

    public function store(Request $request)
    {
        $request->validate([
            'pid' => 'required|string',
            'pname' => 'required|string',
            'redeem_point' => 'required|integer|min:1',
        ]);

        $user = Auth::user();

        DB::beginTransaction();
        try {
            $customer = TblCustomerProd::where('cust_line', $user->line_id)->firstOrFail();

            // ตรวจสอบคะแนนเพียงพอหรือไม่
            if ($customer->point < $request->redeem_point) {
                return response()->json([
                    'success' => false,
                    'message' => 'คะแนนไม่พอสำหรับการแลก',
                ], 400);
            }

            $pointBefore = $customer->point;
            $pointAfter  = $pointBefore - $request->redeem_point;
            $now = Carbon::now();

            // ใช้ tier เดิมของลูกค้าก่อน
            $tierKey = $customer->tier_key;
            $tierExpiredAt = $customer->tier_expired_at;

            // ถ้า tier หมดอายุ → คำนวณ tier ใหม่จากคะแนนปัจจุบัน
            if (!$tierExpiredAt || $now->greaterThan(Carbon::parse($tierExpiredAt))) {
                $currentTier = MembershipTier::orderByDesc('min_point')
                    ->where('min_point', '<=', $pointAfter)
                    ->first();

                $tierKey = $currentTier?->key ?? 'silver';
                $tierExpiredAt = $now->copy()->addYears($currentTier?->duration_years ?? 2);
            }

            // ประเภทสินค้า
            $productType = ProductTier::where('is_active', 1)
                ->where('pid', $request->pid)
                ->value('product_type') ?? 'reward';

            // ดึง process_code จาก type_process_points
            $processCode = TypeProcessPoint::where('transaction_type', 'redeem')
                ->where('process_code', 'REDEEM')
                ->where('is_active', 1)
                ->value('process_code') ?? 'REDEEM';

            // อัปเดตคะแนนและ tier (ไม่ downgrade ก่อนหมดอายุ)
            $customer->update([
                'point'           => $pointAfter,
                'tier_key'        => $tierKey,
                'tier_updated_at' => $now,
                'tier_expired_at' => $tierExpiredAt,
                'last_redeem_at'  => $now,
            ]);

            // บันทึกธุรกรรม
            $transaction = PointTransaction::create([
                'line_id'           => $user->line_id,
                'transaction_type'  => 'redeem',
                'reference_id'      => uniqid('TXN-'),
                'pid'               => $request->pid,
                'pname'             => $request->pname,
                'product_type'      => $productType,
                'process_code'      => $processCode,
                'point_before'      => $pointBefore,
                'point_tran'        => -$request->redeem_point,
                'point_after'       => $pointAfter,
                'tier'              => $tierKey,
                'docdate'           => $now->toDateString(),
                'docno'             => sprintf('RDM-%05d-%s', $customer->id, $now->format('YmdHis')),
                'trandate'          => $now->toDateString(),
                'created_at'        => $now,
                'expired_at'        => $now->copy()->addYears(2)->toDateString(),
            ]);

            DB::commit();

            return response()->json([
                'success'   => true,
                'message'   => 'แลกรางวัลสำเร็จ',
                'new_point' => $pointAfter,
                'new_tier'  => $tierKey,
                'tier_expired_at' => $tierExpiredAt,
                'transaction' => $transaction,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Redeem error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'เกิดข้อผิดพลาดในการแลก'], 500);
        }
    }

    // ประวัติการแลก
    public function history()
    {
        $user = Auth::user();

        $histories = PointTransaction::where('line_id', $user->line_id)
            ->orderByDesc('trandate')
            ->orderByDesc('created_at')
            ->get([
                'pid',
                'pname',
                'point_tran',
                'trandate',
                'point_before',
                'point_after',
                'tier',
                'transaction_type',
                'process_code'
            ]);

        return response()->json(['data' => $histories]);
    }
}