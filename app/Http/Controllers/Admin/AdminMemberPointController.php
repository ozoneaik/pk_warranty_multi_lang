<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\PointAdjustment;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminMemberPointController extends Controller
{

    public function index()
    {
        return Inertia::render('Admin/MembersPoints/index');
    }

    // API สำหรับค้นหาลูกค้าด้วยเบอร์โทร หรือ Line ID
    public function searchCustomer(Request $request)
    {
        $request->validate(['search' => 'required']);
        $search = $request->search;

        // ค้นหาลูกค้า
        $customer = TblCustomerProd::where('cust_tel', $search)
            ->orWhere('cust_line', $search)
            ->first();

        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'ไม่พบข้อมูลลูกค้าจากเบอร์โทรนี้'], 404);
        }

        // ดึงประวัติการใช้/รับพอยต์ของลูกค้านี้ (จำกัด 20 รายการล่าสุด)
        $history = PointTransaction::where('line_id', $customer->cust_line)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'customer' => $customer,
            'history' => $history
        ]);
    }

    public function adjustPoints(Request $request)
    {
        // 1. Validate Form & Image
        $request->validate([
            'cust_line' => 'required',
            'action' => 'required|in:add,deduct,add_by_purchase',
            'amount' => 'required|integer|min:1',
            'remark' => 'required|string|max:255',
            'evidence_image' => 'nullable|image|max:5120', // สูงสุด 5MB
        ]);

        try {
            DB::beginTransaction();

            $customer = TblCustomerProd::where('cust_line', $request->cust_line)->lockForUpdate()->first();
            if (!$customer) {
                throw new \Exception('ไม่พบข้อมูลลูกค้าในระบบ');
            }

            $pointBefore = (int) $customer->point;
            $inputValue = (float) $request->amount;
            $pointToAdjust = 0;

            if ($request->action === 'add') {
                $pointToAdjust = (int) $inputValue;
                $pointAfter = $pointBefore + $pointToAdjust;
                $transactionType = 'earn';
            } elseif ($request->action === 'add_by_purchase') {
                // ✅ Logic คำนวณแต้มจากยอดสั่งซื้อ
                $tier = strtolower($customer->tier_key ?? 'silver');
                $multiplier = match ($tier) {
                    'platinum' => 4,
                    'gold'     => 2,
                    default    => 1, // silver หรืออื่นๆ
                };

                // หาร 100 ปัดเศษลง แล้วคูณด้วยตัวคูณของ Tier
                $pointToAdjust = (int)(floor($inputValue / 100) * $multiplier);

                if ($pointToAdjust <= 0) {
                    throw new \Exception('ยอดสั่งซื้อไม่ถึงเกณฑ์ที่กำหนด (ขั้นต่ำ 100 บาท)');
                }

                $pointAfter = $pointBefore + $pointToAdjust;
                $transactionType = 'earn';
            } else {
                // Deduct
                $pointToAdjust = (int) $inputValue;
                if ($pointBefore < $pointToAdjust) {
                    throw new \Exception('คะแนนสะสมของลูกค้าไม่เพียงพอสำหรับการหักลด');
                }
                $pointAfter = $pointBefore - $pointToAdjust;
                $transactionType = 'adjust';
            }

            // 2. Upload Image to S3 (ถ้ามีการแนบไฟล์มา)
            $imageUrl = null;
            if ($request->hasFile('evidence_image')) {
                try {
                    $path = $request->file('evidence_image')->store('point_adjustments', 's3');
                    $imageUrl = Storage::disk('s3')->url($path);
                } catch (\Exception $imgEx) {
                    throw new \Exception('อัปโหลดรูปภาพหลักฐานไม่สำเร็จ: ' . $imgEx->getMessage());
                }
            }

            // 3. ดึงชื่อแอดมิน (อ้างอิงตาราง admins ผ่าน guard)
            $admin = Auth::guard('admin')->user();
            $adminName = $admin ? $admin->name : 'System Admin';
            $adminId = $admin ? $admin->id : null;
            $docNo = 'ADJ-' . now()->format('YmdHis') . '-' . sprintf('%02d', $adminId ?? 0) . rand(10, 99);
            // 4. อัปเดตคะแนนล่าสุดที่ตารางลูกค้า
            $customer->update(['point' => $pointAfter]);

            // 5. บันทึกลงตารางแยก PointAdjustment
            $adjustment = PointAdjustment::create([
                'line_id' => $customer->cust_line,
                'adjust_by' => $adminName,
                'adjust_by_id' => $adminId,
                'action' => $request->action,
                'amount' => $pointToAdjust, // บันทึกเฉพาะจำนวนพอยต์ที่ได้จริงๆ
                'remark' => $request->action === 'add_by_purchase' ? $request->remark . " (ยอดซื้อ " . number_format($inputValue, 2) . " บ.)" : $request->remark,
                'evidence_image_url' => $imageUrl,
            ]);

            // 6. บันทึกประวัติ Transaction ปกติ (เพื่อการดึง Report รวมที่ง่ายขึ้น)
            $transaction = PointTransaction::create([
                'line_id'          => $customer->cust_line,
                'transaction_type' => $transactionType,
                'process_code'     => 'ADMIN_ADJUST',
                // 'reference_id'     => $docNo,
                'reference_id'     => (string)$adjustment->id,
                'pname'            => $request->action === 'add_by_purchase' ? $request->remark . " (คำนวณจากยอดซื้อ)" : $request->remark,
                'point_before'     => $pointBefore,
                'point_tran'       => ($request->action === 'deduct' ? -$pointToAdjust : $pointToAdjust),
                'point_after'      => $pointAfter,
                'tier'             => $customer->tier_key,
                'docdate'          => now()->toDateString(),
                'trandate'         => now()->toDateString(),
                'docno'            => $docNo,
                'created_at'       => now(),
                'expired_at'       => now()->addYears(2)->toDateString(),
                'adjust_by'        => $adminName,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'ปรับปรุงคะแนนและบันทึกหลักฐานสำเร็จ',
                'customer' => $customer,
                'new_transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin Point Adjust Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
