<?php

namespace App\Http\Controllers\Privilege;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Coupons;
use App\Models\MasterWaaranty\MembershipTier;
use App\Models\MasterWaaranty\PointRedeemCode;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\Privilege;
use App\Models\MasterWaaranty\ProductTier;
use App\Models\MasterWaaranty\RedeemHistory;
use App\Models\MasterWaaranty\Reward;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TypeProcessPoint;
use App\Models\MasterWaaranty\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RedeemController extends Controller
{
    // public function store(Request $request)
    // {
    //     // 1. ตรวจสอบข้อมูล (Validation)
    //     $this->validateRedeemRequest($request);

    //     $user = Auth::user();
    //     $now = Carbon::now();

    //     DB::beginTransaction();
    //     try {
    //         // ล็อคข้อมูลลูกค้า
    //         $customer = TblCustomerProd::where('cust_line', $user->line_id)->lockForUpdate()->firstOrFail();
    //         $tierKey = strtolower($customer->tier_key ?? 'silver');

    //         // 2. ค้นหาข้อมูลสินค้าและตรวจสอบเงื่อนไข
    //         $data = $this->prepareRewardData($request, $customer, $tierKey, $now);

    //         // Extract ข้อมูลจาก Array ที่ return มา
    //         $rewardItem = $data['item'];
    //         $itemName = $data['name'];
    //         $requiredPoint = $data['point'];
    //         $earnPoint = $data['earn_point'];
    //         $transactionType = $data['type'];
    //         $processCode = $data['process_code'];
    //         $isDeliveryItem = $data['is_delivery'];
    //         $expiryDate = $data['expiry_date'];
    //         $couponCodeToReturn = $data['code_to_return'];

    //         // 3. ตรวจสอบคะแนนคงเหลือ
    //         if ($transactionType === 'redeem' && $customer->point < $requiredPoint) {
    //             throw new \Exception('คะแนนสะสมของคุณไม่เพียงพอ');
    //         }

    //         if ($request->boolean('update_profile') && $request->delivery_type === 'delivery') {
    //         $customer->update([
    //             // 'cust_tel'         => $request->phone,
    //             'cust_address'     => $request->address,
    //             'cust_subdistrict' => $request->sub_district,
    //             'cust_district'    => $request->district,
    //             'cust_province'    => $request->province,
    //             'cust_zipcode'     => $request->zipcode,
    //         ]);
    //     }

    //         // 4. ตัด/เพิ่ม คะแนนลูกค้า
    //         $pointBefore = $customer->point;
    //         $pointAfter = $this->updateCustomerPoints($customer, $transactionType, $pointBefore, $earnPoint, $requiredPoint, $now);
    //         $pointTran = ($transactionType === 'earn') ? $earnPoint : -$requiredPoint;

    //         // 5. บันทึก Transaction
    //         $transaction = $this->createTransaction(
    //             $user,
    //             $customer,
    //             $request,
    //             $itemName,
    //             $processCode,
    //             $transactionType,
    //             $pointBefore,
    //             $pointTran,
    //             $pointAfter,
    //             $tierKey,
    //             $now
    //         );

    //         // 6. สร้าง Order หรือ Coupon Code ตามประเภท
    //         $couponData = null;

    //         if ($isDeliveryItem && $transactionType === 'redeem') {
    //             $this->createDeliveryOrder($user, $transaction, $request, $itemName, $requiredPoint, $now);
    //             $couponData = ['code' => 'DELIVERY', 'expired_at' => '-'];
    //         } elseif ($transactionType === 'redeem') {
    //             // แยกฟังก์ชันสร้าง Coupon Code ออกมา
    //             $couponData = $this->createDigitalCoupon($user, $transaction, $couponCodeToReturn, $expiryDate);
    //         }

    //         DB::commit();

    //         $msg = ($transactionType === 'earn' && $earnPoint > 0)
    //             ? "สุขสันต์วันเกิด! คุณได้รับ {$earnPoint} คะแนน"
    //             : "ทำรายการสำเร็จ";

    //         return response()->json([
    //             'success'      => true,
    //             'message'      => $msg,
    //             'new_point'    => $pointAfter,
    //             'new_tier'     => $tierKey,
    //             'coupon'       => $couponData,
    //             'product_type' => $request->product_type,
    //             'is_delivery'  => $isDeliveryItem
    //         ]);
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         // ถ้า Error ไม่ใช่ Exception ที่เรา throw เอง ให้ Log ไว้
    //         if ($e->getMessage() !== 'คะแนนสะสมของคุณไม่เพียงพอ' && !str_contains($e->getMessage(), 'ไม่พบ')) {
    //             Log::error('Redeem Error', ['msg' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    //         }
    //         return response()->json(['success' => false, 'message' => $e->getMessage()], 400); // ส่ง 400 เพื่อให้ Frontend รู้ว่าเป็น Error จาก Logic
    //     }
    // }

    // // PRIVATE HELPER FUNCTIONS
    // /**
    //  * ฟังก์ชันตรวจสอบข้อมูลขาเข้า
    //  */
    // private function validateRedeemRequest(Request $request)
    // {
    //     $request->validate([
    //         'pid'          => 'required|string',
    //         'redeem_point' => 'required|integer|min:0',
    //         'product_type' => 'required|string',
    //         'delivery_type' => 'nullable|string',
    //         // Validate ที่อยู่เฉพาะเมื่อเป็น Delivery
    //         'customer_name' => 'required_if:delivery_type,delivery|nullable|string',
    //         'phone_number'  => 'required_if:delivery_type,delivery|nullable|string',
    //         'address'       => 'required_if:delivery_type,delivery|nullable|string',
    //         'sub_district'  => 'required_if:delivery_type,delivery|nullable|string',
    //         'district'      => 'required_if:delivery_type,delivery|nullable|string',
    //         'province'      => 'required_if:delivery_type,delivery|nullable|string',
    //         'zipcode'       => 'required_if:delivery_type,delivery|nullable|string',
    //     ], [
    //         'address.required_if' => 'กรุณาระบุที่อยู่สำหรับการจัดส่ง',
    //         'phone_number.required_if' => 'กรุณาระบุเบอร์โทรศัพท์',
    //     ]);
    // }

    // /**
    //  * ฟังก์ชันเตรียมข้อมูลสินค้า คำนวณแต้ม และตรวจสอบเงื่อนไขต่างๆ
    //  */
    // private function prepareRewardData($request, $customer, $tierKey, $now)
    // {
    //     $rewardItem = null;
    //     $itemName = '';
    //     $transactionType = 'redeem';
    //     $processCode = 'REDEEM';
    //     $requiredPoint = 0;
    //     $earnPoint = 0;
    //     $isDeliveryItem = false;
    //     $expiryDate = null;
    //     $couponCodeToReturn = null;

    //     // --- 1. PRIVILEGE ---
    //     if ($request->product_type === 'privilege') {
    //         $rewardItem = Privilege::where('privilege_code', $request->pid)->where('is_active', 1)->lockForUpdate()->first();
    //         if (!$rewardItem) throw new \Exception('ไม่พบข้อมูลสิทธิพิเศษ');

    //         $itemName = $rewardItem->privilege_name;
    //         $isDeliveryItem = ($rewardItem->delivery_type ?? 'receive_at_store') === 'delivery';

    //         // Birthday Check
    //         if (stripos($itemName, 'BIRTHDAY') !== false) {
    //             if (empty($customer->cust_birthdate)) throw new \Exception('ไม่พบข้อมูลวันเกิด');
    //             $birthDate = Carbon::parse($customer->cust_birthdate);
    //             if ($birthDate->month !== $now->month) throw new \Exception('สิทธิพิเศษนี้สำหรับเดือนเกิดเท่านั้น');

    //             // Check Already Claimed
    //             $alreadyClaimed = PointTransaction::where('line_id', $customer->cust_line)
    //                 ->whereYear('trandate', $now->year)
    //                 ->where(function ($q) use ($request) {
    //                     $q->where('pid', $request->pid)->orWhere('process_code', 'BIRTHDAY');
    //                 })
    //                 ->exists();
    //             if ($alreadyClaimed) throw new \Exception('คุณได้รับสิทธิ์วันเกิดนี้ไปแล้ว');

    //             // Get Points
    //             $processPoint = TypeProcessPoint::where('process_code', 'BIRTHDAY')->where('is_active', 1)->first();
    //             if ($processPoint) {
    //                 $transactionType = 'earn';
    //                 $processCode = $processPoint->process_code;
    //                 $earnPointField = "point_{$tierKey}";
    //                 $earnPoint = $processPoint->$earnPointField > 0 ? $processPoint->$earnPointField : ($processPoint->default_point ?? 0);
    //             }
    //         } else {
    //             $pointField = "points_{$tierKey}";
    //             $requiredPoint = $rewardItem->$pointField ?? $rewardItem->points_silver ?? 0;
    //         }
    //     }
    //     // --- 2. REWARD / COUPON ---
    //     else {
    //         // A. Check Reward Table
    //         $rewardItem = Reward::where('rewards_id', $request->pid)->where('is_active', 1)->lockForUpdate()->first();

    //         if ($rewardItem) {
    //             $itemName = $rewardItem->reward_name;
    //             $pointField = "points_{$tierKey}";
    //             $requiredPoint = $rewardItem->$pointField ?? $rewardItem->points_silver ?? 999999;
    //             $expiryDate = $rewardItem->end_date ?? $now->copy()->addDays(30);
    //             $isDeliveryItem = ($rewardItem->delivery_type ?? 'receive_at_store') === 'delivery';
    //         } else {
    //             // B. Check Coupon Table
    //             $couponItem = Coupons::where('code', $request->pid)->where('is_active', 1)->lockForUpdate()->first();
    //             if (!$couponItem) throw new \Exception('ไม่พบข้อมูลรายการนี้');

    //             $rewardItem = $couponItem;
    //             $itemName = $couponItem->name;
    //             $requiredPoint = 0; // สมมติ 0 สำหรับคูปองใหม่
    //             $isDeliveryItem = false; // Coupon ปกติเป็น Digital

    //             // Expiry Logic
    //             if ($couponItem->expiry_mode === 'DYNAMIC') {
    //                 $unit = $couponItem->expiry_dynamic_unit === 'MONTHS' ? 'addMonths' : ($couponItem->expiry_dynamic_unit === 'YEARS' ? 'addYears' : 'addDays');
    //                 $val = $couponItem->expiry_dynamic_value ?? 30;
    //                 $expiryDate = $now->copy()->$unit($val);
    //             } else {
    //                 $expiryDate = $couponItem->end_date;
    //             }

    //             // Code Generation
    //             if ($couponItem->is_auto_generate_code) {
    //                 do {
    //                     $couponCodeToReturn = strtoupper(Str::random(8));
    //                 } while (PointRedeemCode::where('redeem_code', $couponCodeToReturn)->exists());
    //             } else {
    //                 $couponCodeToReturn = $couponItem->code;
    //             }

    //             // Quota Check
    //             $this->checkQuota($couponItem, $request->pid, $customer->cust_line);
    //         }
    //     }

    //     // Common Validation
    //     if (($rewardItem->start_date && $now->lt($rewardItem->start_date)) || ($rewardItem->end_date && $now->gt($rewardItem->end_date))) {
    //         throw new \Exception('ไม่อยู่ในช่วงเวลาที่สามารถทำรายการได้');
    //     }

    //     return [
    //         'item' => $rewardItem,
    //         'name' => $itemName,
    //         'point' => $requiredPoint,
    //         'earn_point' => $earnPoint,
    //         'type' => $transactionType,
    //         'process_code' => $processCode,
    //         'is_delivery' => $isDeliveryItem,
    //         'expiry_date' => $expiryDate,
    //         'code_to_return' => $couponCodeToReturn
    //     ];
    // }

    // private function checkQuota($item, $pid, $lineId)
    // {
    //     if ($item->quota_limit_total > 0) {
    //         $total = PointTransaction::where('pid', $pid)->count();
    //         if ($total >= $item->quota_limit_total) throw new \Exception('สิทธิ์เต็มแล้ว');
    //     }
    //     if ($item->quota_limit_user > 0) {
    //         $userTotal = PointTransaction::where('line_id', $lineId)->where('pid', $pid)->count();
    //         if ($userTotal >= $item->quota_limit_user) throw new \Exception('คุณใช้สิทธิ์ครบแล้ว');
    //     }
    // }

    // private function updateCustomerPoints($customer, $type, $currentPoint, $earn, $redeem, $now)
    // {
    //     if ($type === 'earn') {
    //         $newPoint = $currentPoint + $earn;
    //         $customer->update(['point' => $newPoint, 'last_earn_at' => $now]);
    //     } else {
    //         $newPoint = $currentPoint - $redeem;
    //         $customer->update(['point' => $newPoint, 'last_redeem_at' => $now]);
    //     }
    //     return $newPoint;
    // }

    // private function createTransaction($user, $customer, $request, $pname, $processCode, $type, $before, $tran, $after, $tier, $now)
    // {
    //     $docPrefix = ($type === 'earn') ? 'ERN' : 'RDM';
    //     return PointTransaction::create([
    //         'line_id'          => $user->line_id,
    //         'transaction_type' => $type,
    //         'reference_id'     => uniqid('TRX-'),
    //         'pid'              => $request->pid,
    //         'pname'            => $pname,
    //         'product_type'     => $request->product_type,
    //         'process_code'     => $processCode,
    //         'point_before'     => $before,
    //         'point_tran'       => $tran,
    //         'point_after'      => $after,
    //         'tier'             => $tier,
    //         'trandate'         => $now->toDateString(),
    //         'docdate'          => $now->toDateString(),
    //         'docno'            => sprintf('%s-%05d-%s', $docPrefix, $customer->id, $now->format('YmdHis')),
    //         'created_at'       => $now,
    //         'expired_at'       => $now->copy()->addYears(2)->toDateString(),
    //     ]);
    // }

    // /**
    //  * ฟังก์ชันสร้าง Order (สำหรับ Delivery)
    //  */
    // private function createDeliveryOrder($user, $transaction, $request, $pname, $points, $now)
    // {
    //     return Order::create([
    //         'order_number'    => 'ORD-' . $now->format('Ymd') . '-' . strtoupper(Str::random(5)),
    //         'line_id'         => $user->line_id,
    //         'transaction_id'  => $transaction->id,
    //         'customer_name'   => $request->customer_name ?? $user->name,
    //         'phone_number'    => $request->phone_number,
    //         'address'         => $request->address,
    //         'sub_district'    => $request->sub_district,
    //         'district'        => $request->district,
    //         'province'        => $request->province,
    //         'zipcode'         => $request->zipcode,
    //         'product_name'    => $pname,
    //         'product_code'    => $request->pid,
    //         'quantity'        => 1,
    //         'points_redeemed' => $points,
    //         'status'          => 'pending',
    //     ]);
    // }

    // /**
    //  * ฟังก์ชันสร้าง Coupon Code (สำหรับ Digital)
    //  */
    // private function createDigitalCoupon($user, $transaction, $codeToReturn, $expiryDate)
    // {
    //     // ถ้ายังไม่มี Code ให้ Gen ใหม่
    //     if (!$codeToReturn) {
    //         do {
    //             $codeToReturn = strtoupper(Str::random(8));
    //         } while (PointRedeemCode::where('redeem_code', $codeToReturn)->exists());
    //     }

    //     PointRedeemCode::create([
    //         'transaction_id'  => $transaction->id,
    //         'line_id'         => $user->line_id,
    //         'product_tier_id' => 0,
    //         'redeem_code'     => $codeToReturn,
    //         'status'          => 'active',
    //         'expired_at'      => $expiryDate,
    //     ]);

    //     return [
    //         'code' => $codeToReturn,
    //         'expired_at' => $expiryDate ? Carbon::parse($expiryDate)->format('d/m/Y H:i') : '-',
    //     ];
    // }

    // // ประวัติการแลก
    // public function history()
    // {
    //     $user = Auth::user();

    //     $histories = PointTransaction::where('point_transactions.line_id', $user->line_id) // ★ ระบุชื่อตารางหน้า line_id
    //         ->leftJoin('point_redeem_codes', 'point_transactions.id', '=', 'point_redeem_codes.transaction_id')
    //         ->orderByDesc('point_transactions.created_at')
    //         ->get([
    //             'point_transactions.*',
    //             'point_redeem_codes.redeem_code',
    //             'point_redeem_codes.status as coupon_status',
    //             'point_redeem_codes.expired_at as coupon_expired_at',
    //             'point_redeem_codes.created_at as coupon_created_at'
    //         ]);

    //     return response()->json(['data' => $histories]);
    // }
    // -------------------------------------------------------------------------------------------------------
    public function store(Request $request)
    {
        // 1. ตรวจสอบข้อมูล (Validation)
        $this->validateRedeemRequest($request);

        $user = Auth::user();
        $now = Carbon::now();

        return DB::transaction(function () use ($request, $user, $now) {
            try {
                // ล็อคข้อมูลลูกค้า
                $customer = TblCustomerProd::where('cust_line', $user->line_id)->lockForUpdate()->firstOrFail();
                $tierKey = strtolower($customer->tier_key ?? 'silver');

                // 2. ค้นหาข้อมูลสินค้าและตรวจสอบเงื่อนไข
                $data = $this->prepareRewardData($request, $customer, $tierKey, $now);

                $rewardItem = $data['item'];
                $itemName = $data['name'];
                $requiredPoint = $data['point'];
                $earnPoint = $data['earn_point'];
                $transactionType = $data['type'];
                $processCode = $data['process_code'];
                $isDeliveryItem = $data['is_delivery'];
                $expiryDate = $data['expiry_date'];
                $couponCodeToReturn = $data['code_to_return'];

                // 3. ตรวจสอบคะแนนคงเหลือ
                if ($transactionType === 'redeem' && $customer->point < $requiredPoint) {
                    // ส่งเป็น JSON 400 เพื่อให้ Frontend Handle ได้ง่าย
                    return response()->json(['success' => false, 'message' => 'คะแนนสะสมของคุณไม่เพียงพอ'], 400);
                }

                // อัปเดตข้อมูล Profile (ถ้ามี)
                if ($request->boolean('update_profile') && $request->delivery_type === 'delivery') {
                    $customer->update([
                        'cust_address'     => $request->address,
                        'cust_subdistrict' => $request->sub_district,
                        'cust_district'    => $request->district,
                        'cust_province'    => $request->province,
                        'cust_zipcode'     => $request->zipcode,
                    ]);
                }

                // 4. ✅ ตัด/เพิ่ม คะแนนลูกค้าทันที (Immediate)
                $pointBefore = $customer->point;
                $pointTran = 0;

                if ($transactionType === 'earn') {
                    $customer->increment('point', $earnPoint);
                    $customer->update(['last_earn_at' => $now]);
                    $pointTran = $earnPoint;
                } else {
                    $customer->decrement('point', $requiredPoint); // ตัดเลย
                    $customer->update(['last_redeem_at' => $now]);
                    $pointTran = -$requiredPoint; // ค่าติดลบ
                }

                $pointAfter = $customer->fresh()->point; // ดึงค่าล่าสุด

                // 5. ✅ บันทึก Transaction
                $transaction = $this->createTransaction(
                    $user,
                    $customer,
                    $request,
                    $itemName,
                    $processCode,
                    $transactionType,
                    $pointBefore,
                    $pointTran,
                    $pointAfter,
                    $tierKey,
                    $now
                );

                // 6. ✅ สร้าง Order หรือ Coupon
                $couponData = null;

                if ($transactionType === 'redeem') {
                    if ($isDeliveryItem) {
                        // สินค้าจัดส่ง -> สร้าง Order (Pending)
                        $this->createDeliveryOrder($user, $transaction, $request, $itemName, $requiredPoint, $now);
                        $couponData = ['code' => 'DELIVERY', 'expired_at' => '-'];
                    } else {
                        // คูปอง Digital -> สร้าง Code เลย
                        $couponData = $this->createDigitalCoupon($user, $transaction, $couponCodeToReturn, $expiryDate);
                    }
                }

                $msg = ($transactionType === 'earn' && $earnPoint > 0)
                    ? "สุขสันต์วันเกิด! คุณได้รับ {$earnPoint} คะแนน"
                    : "ทำรายการสำเร็จ";

                return response()->json([
                    'success'      => true,
                    'message'      => $msg,
                    'new_point'    => $pointAfter,
                    'new_tier'     => $tierKey,
                    'coupon'       => $couponData,
                    'product_type' => $request->product_type,
                    'is_delivery'  => $isDeliveryItem
                ]);
            } catch (\Exception $e) {
                // ถ้า Error ใน Transaction มันจะ Rollback เอง
                Log::error('Redeem Error', ['msg' => $e->getMessage()]);
                throw $e;
            }
        });
    }

    // public function store(Request $request)
    // {
    //     // 1. ตรวจสอบข้อมูล (Validation)
    //     $this->validateRedeemRequest($request);

    //     $user = Auth::user();
    //     $now = Carbon::now();

    //     DB::beginTransaction();
    //     try {
    //         // ล็อคข้อมูลลูกค้า
    //         $customer = TblCustomerProd::where('cust_line', $user->line_id)->lockForUpdate()->firstOrFail();
    //         $tierKey = strtolower($customer->tier_key ?? 'silver');

    //         // 2. ค้นหาข้อมูลสินค้าและตรวจสอบเงื่อนไข
    //         $data = $this->prepareRewardData($request, $customer, $tierKey, $now);

    //         // Extract ข้อมูลจาก Array ที่ return มา
    //         $rewardItem = $data['item'];
    //         $itemName = $data['name'];
    //         $requiredPoint = $data['point'];
    //         $earnPoint = $data['earn_point'];
    //         $transactionType = $data['type'];
    //         $processCode = $data['process_code'];
    //         $isDeliveryItem = $data['is_delivery'];
    //         $expiryDate = $data['expiry_date'];
    //         $couponCodeToReturn = $data['code_to_return'];

    //         // 3. ตรวจสอบคะแนนคงเหลือ
    //         if ($transactionType === 'redeem' && $customer->point < $requiredPoint) {
    //             throw new \Exception('คะแนนสะสมของคุณไม่เพียงพอ');
    //         }

    //         if ($request->boolean('update_profile') && $request->delivery_type === 'delivery') {
    //             $customer->update([
    //                 'cust_address'     => $request->address,
    //                 'cust_subdistrict' => $request->sub_district,
    //                 'cust_district'    => $request->district,
    //                 'cust_province'    => $request->province,
    //                 'cust_zipcode'     => $request->zipcode,
    //             ]);
    //         }

    //         // 4. ตัด/เพิ่ม คะแนนลูกค้า
    //         $pointBefore = $customer->point;
    //         $pointAfter = $this->updateCustomerPoints($customer, $transactionType, $pointBefore, $earnPoint, $requiredPoint, $now);
    //         $pointTran = ($transactionType === 'earn') ? $earnPoint : -$requiredPoint;

    //         // 5. บันทึก Transaction
    //         $transaction = $this->createTransaction(
    //             $user,
    //             $customer,
    //             $request,
    //             $itemName,
    //             $processCode,
    //             $transactionType,
    //             $pointBefore,
    //             $pointTran,
    //             $pointAfter,
    //             $tierKey,
    //             $now
    //         );

    //         // 6. สร้าง Order หรือ Coupon Code ตามประเภท
    //         $couponData = null;

    //         if ($isDeliveryItem && $transactionType === 'redeem') {
    //             $this->createDeliveryOrder($user, $transaction, $request, $itemName, $requiredPoint, $now);
    //             $couponData = ['code' => 'DELIVERY', 'expired_at' => '-'];
    //         } elseif ($transactionType === 'redeem') {
    //             $couponData = $this->createDigitalCoupon($user, $transaction, $couponCodeToReturn, $expiryDate);
    //         }

    //         DB::commit();

    //         $msg = ($transactionType === 'earn' && $earnPoint > 0)
    //             ? "สุขสันต์วันเกิด! คุณได้รับ {$earnPoint} คะแนน"
    //             : "ทำรายการสำเร็จ";

    //         return response()->json([
    //             'success'      => true,
    //             'message'      => $msg,
    //             'new_point'    => $pointAfter,
    //             'new_tier'     => $tierKey,
    //             'coupon'       => $couponData,
    //             'product_type' => $request->product_type,
    //             'is_delivery'  => $isDeliveryItem
    //         ]);
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         if ($e->getMessage() !== 'คะแนนสะสมของคุณไม่เพียงพอ' && !str_contains($e->getMessage(), 'ไม่พบ')) {
    //             Log::error('Redeem Error', ['msg' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    //         }
    //         return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
    //     }
    // }

    // PRIVATE HELPER FUNCTIONS
    private function validateRedeemRequest(Request $request)
    {
        $request->validate([
            'pid'          => 'required|string',
            'redeem_point' => 'required|integer|min:0',
            'product_type' => 'required|string',
            'delivery_type' => 'nullable|string',
            'customer_name' => 'required_if:delivery_type,delivery|nullable|string',
            'phone_number'  => 'required_if:delivery_type,delivery|nullable|string',
            'address'       => 'required_if:delivery_type,delivery|nullable|string',
            'sub_district'  => 'required_if:delivery_type,delivery|nullable|string',
            'district'      => 'required_if:delivery_type,delivery|nullable|string',
            'province'      => 'required_if:delivery_type,delivery|nullable|string',
            'zipcode'       => 'required_if:delivery_type,delivery|nullable|string',
        ], [
            'address.required_if' => 'กรุณาระบุที่อยู่สำหรับการจัดส่ง',
            'phone_number.required_if' => 'กรุณาระบุเบอร์โทรศัพท์',
        ]);
    }

    private function prepareRewardData($request, $customer, $tierKey, $now)
    {
        $rewardItem = null;
        $itemName = '';
        $transactionType = 'redeem';
        $processCode = 'REDEEM';
        $requiredPoint = 0;
        $earnPoint = 0;
        $isDeliveryItem = false;
        $expiryDate = null;
        $couponCodeToReturn = null;

        // --- 1. PRIVILEGE ---
        if ($request->product_type === 'privilege') {
            $rewardItem = Privilege::where('privilege_code', $request->pid)->where('is_active', 1)->lockForUpdate()->first();
            if (!$rewardItem) throw new \Exception('ไม่พบข้อมูลสิทธิพิเศษ');

            $itemName = $rewardItem->privilege_name;
            $isDeliveryItem = ($rewardItem->delivery_type ?? 'receive_at_store') === 'delivery';

            // Birthday Check
            if (stripos($itemName, 'BIRTHDAY') !== false) {
                if (empty($customer->cust_birthdate)) throw new \Exception('ไม่พบข้อมูลวันเกิด');
                $birthDate = Carbon::parse($customer->cust_birthdate);
                if ($birthDate->month !== $now->month) throw new \Exception('สิทธิพิเศษนี้สำหรับเดือนเกิดเท่านั้น');

                $alreadyClaimed = PointTransaction::where('line_id', $customer->cust_line)
                    ->whereYear('trandate', $now->year)
                    ->where(function ($q) use ($request) {
                        $q->where('pid', $request->pid)->orWhere('process_code', 'BIRTHDAY');
                    })
                    ->exists();
                if ($alreadyClaimed) throw new \Exception('คุณได้รับสิทธิ์วันเกิดนี้ไปแล้ว');

                $processPoint = TypeProcessPoint::where('process_code', 'BIRTHDAY')->where('is_active', 1)->first();
                if ($processPoint) {
                    $transactionType = 'earn';
                    $processCode = $processPoint->process_code;
                    $earnPointField = "point_{$tierKey}";
                    $earnPoint = $processPoint->$earnPointField > 0 ? $processPoint->$earnPointField : ($processPoint->default_point ?? 0);
                }
            } else {
                // ★★★ แก้ไข Logic ราคาส่วน Privilege ★★★
                $requiredPoint = $rewardItem->{"points_{$tierKey}"}; // ลองดึงราคา Tier ตัวเองก่อน

                // Fallback: ถ้า Tier ตัวเองเป็น 0 ให้ไปดึงราคา Tier ที่ต่ำกว่า
                if (empty($requiredPoint)) {
                    if ($tierKey === 'platinum') $requiredPoint = $rewardItem->points_gold;
                    if (empty($requiredPoint)) $requiredPoint = $rewardItem->points_silver;
                }

                $requiredPoint = (int)($requiredPoint ?? 0);
            }
        }
        // --- 2. REWARD / COUPON ---
        else {
            // A. Check Reward Table
            $rewardItem = Reward::where('rewards_id', $request->pid)->where('is_active', 1)->lockForUpdate()->first();

            if ($rewardItem) {
                $itemName = $rewardItem->reward_name;

                // ★★★ แก้ไข Logic ราคาส่วน Reward ★★★
                $requiredPoint = $rewardItem->{"points_{$tierKey}"}; // ลองดึงราคา Tier ตัวเองก่อน

                // Fallback: ถ้า Tier ตัวเองเป็น 0 หรือ null ให้ไปดึงราคา Tier ที่ต่ำกว่า
                if (empty($requiredPoint)) {
                    if ($tierKey === 'platinum') $requiredPoint = $rewardItem->points_gold;
                    if (empty($requiredPoint)) $requiredPoint = $rewardItem->points_silver;
                }

                // Default ค่า 999999 หากไม่มีราคาเลย (ป้องกันแลกฟรีโดยไม่ตั้งใจ)
                $requiredPoint = (int)($requiredPoint ?? 999999);

                $expiryDate = $rewardItem->end_date ?? $now->copy()->addDays(30);
                $isDeliveryItem = ($rewardItem->delivery_type ?? 'receive_at_store') === 'delivery';
            } else {
                // B. Check Coupon Table
                $couponItem = Coupons::where('code', $request->pid)->where('is_active', 1)->lockForUpdate()->first();
                if (!$couponItem) throw new \Exception('ไม่พบข้อมูลรายการนี้');

                $rewardItem = $couponItem;
                $itemName = $couponItem->name;
                $requiredPoint = 0; // สมมติ 0 สำหรับคูปองใหม่ (หรือแก้ตาม DB)
                $isDeliveryItem = false;

                if ($couponItem->expiry_mode === 'DYNAMIC') {
                    $unit = $couponItem->expiry_dynamic_unit === 'MONTHS' ? 'addMonths' : ($couponItem->expiry_dynamic_unit === 'YEARS' ? 'addYears' : 'addDays');
                    $val = $couponItem->expiry_dynamic_value ?? 30;
                    $expiryDate = $now->copy()->$unit($val);
                } else {
                    $expiryDate = $couponItem->end_date;
                }

                if ($couponItem->is_auto_generate_code) {
                    do {
                        $couponCodeToReturn = strtoupper(Str::random(8));
                    } while (PointRedeemCode::where('redeem_code', $couponCodeToReturn)->exists());
                } else {
                    $couponCodeToReturn = $couponItem->code;
                }

                $this->checkQuota($couponItem, $request->pid, $customer->cust_line);
            }
        }

        // Common Validation
        if (($rewardItem->start_date && $now->lt($rewardItem->start_date)) || ($rewardItem->end_date && $now->gt($rewardItem->end_date))) {
            throw new \Exception('ไม่อยู่ในช่วงเวลาที่สามารถทำรายการได้');
        }

        return [
            'item' => $rewardItem,
            'name' => $itemName,
            'point' => $requiredPoint,
            'earn_point' => $earnPoint,
            'type' => $transactionType,
            'process_code' => $processCode,
            'is_delivery' => $isDeliveryItem,
            'expiry_date' => $expiryDate,
            'code_to_return' => $couponCodeToReturn
        ];
    }

    private function checkQuota($item, $pid, $lineId)
    {
        if ($item->quota_limit_total > 0) {
            $total = PointTransaction::where('pid', $pid)->count();
            if ($total >= $item->quota_limit_total) throw new \Exception('สิทธิ์เต็มแล้ว');
        }
        if ($item->quota_limit_user > 0) {
            $userTotal = PointTransaction::where('line_id', $lineId)->where('pid', $pid)->count();
            if ($userTotal >= $item->quota_limit_user) throw new \Exception('คุณใช้สิทธิ์ครบแล้ว');
        }
    }

    private function updateCustomerPoints($customer, $type, $currentPoint, $earn, $redeem, $now)
    {
        if ($type === 'earn') {
            $newPoint = $currentPoint + $earn;
            $customer->update(['point' => $newPoint, 'last_earn_at' => $now]);
        } else {
            $newPoint = $currentPoint - $redeem;
            $customer->update(['point' => $newPoint, 'last_redeem_at' => $now]);
        }
        return $newPoint;
    }

    private function createTransaction($user, $customer, $request, $pname, $processCode, $type, $before, $tran, $after, $tier, $now)
    {
        $docPrefix = ($type === 'earn') ? 'ERN' : 'RDM';
        return PointTransaction::create([
            'line_id'          => $user->line_id,
            'transaction_type' => $type,
            'reference_id'     => uniqid('TRX-'),
            'pid'              => $request->pid,
            'pname'            => $pname,
            'product_type'     => $request->product_type,
            'process_code'     => $processCode,
            'point_before'     => $before,
            'point_tran'       => $tran,
            'point_after'      => $after,
            'tier'             => $tier,
            'trandate'         => $now->toDateString(),
            'docdate'          => $now->toDateString(),
            'docno'            => sprintf('%s-%05d-%s', $docPrefix, $customer->id, $now->format('YmdHis')),
            'created_at'       => $now,
            'expired_at'       => $now->copy()->addYears(2)->toDateString(),
        ]);
    }

    private function createDeliveryOrder($user, $transaction, $request, $pname, $points, $now)
    {
        return Order::create([
            'order_number'    => 'ORD-' . $now->format('Ymd') . '-' . strtoupper(Str::random(5)),
            'line_id'         => $user->line_id,
            'transaction_id'  => $transaction->id,
            'customer_name'   => $request->customer_name ?? $user->name,
            'phone_number'    => $request->phone_number,
            'address'         => $request->address,
            'sub_district'    => $request->sub_district,
            'district'        => $request->district,
            'province'        => $request->province,
            'zipcode'         => $request->zipcode,
            'product_name'    => $pname,
            'product_code'    => $request->pid,
            'quantity'        => 1,
            'points_redeemed' => $points,
            'status'          => 'pending',
        ]);
    }

    private function createDigitalCoupon($user, $transaction, $codeToReturn, $expiryDate)
    {
        if (!$codeToReturn) {
            do {
                $codeToReturn = strtoupper(Str::random(8));
            } while (PointRedeemCode::where('redeem_code', $codeToReturn)->exists());
        }

        PointRedeemCode::create([
            'transaction_id'  => $transaction->id,
            'line_id'         => $user->line_id,
            'product_tier_id' => 0,
            'redeem_code'     => $codeToReturn,
            'status'          => 'active',
            'expired_at'      => $expiryDate,
        ]);

        return [
            'code' => $codeToReturn,
            'expired_at' => $expiryDate ? Carbon::parse($expiryDate)->format('d/m/Y H:i') : '-',
        ];
    }

    public function history()
    {
        $user = Auth::user();

        $histories = PointTransaction::where('point_transactions.line_id', $user->line_id)
            ->leftJoin('point_redeem_codes', 'point_transactions.id', '=', 'point_redeem_codes.transaction_id')
            ->orderByDesc('point_transactions.created_at')
            ->get([
                'point_transactions.*',
                'point_redeem_codes.redeem_code',
                'point_redeem_codes.status as coupon_status',
                'point_redeem_codes.expired_at as coupon_expired_at',
                'point_redeem_codes.created_at as coupon_created_at'
            ]);

        return response()->json(['data' => $histories]);
    }
}
