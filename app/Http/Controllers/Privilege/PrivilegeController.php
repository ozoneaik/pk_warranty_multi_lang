<?php

namespace App\Http\Controllers\Privilege;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Coupons;
use App\Models\MasterWaaranty\MembershipTier;
use App\Models\MasterWaaranty\Order;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\Privilege;
use App\Models\MasterWaaranty\ProductTier;
use App\Models\MasterWaaranty\Reward;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TypeProcessPoint;
use App\Services\TierService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PrivilegeController extends Controller
{
    // public function index()
    // {
    //     $user = Auth::user();
    //     $avatar = session('line_avatar') ?? $user->line_avatar ?? null;
    //     $now = Carbon::now();
    //     $today = $now->toDateString();

    //     // 1. ตรวจสอบข้อมูลลูกค้า
    //     if (empty($user->line_id)) return $this->renderEmptyPrivilege($user, $avatar);
    //     $customer = TblCustomerProd::where('cust_line', $user->line_id)->first();
    //     if (!$customer) return $this->renderEmptyPrivilege($user, $avatar);

    //     // 2. จัดการ Tier
    //     $point = (int)($customer->point ?? 0);
    //     $tierKey = strtolower($customer->tier_key ?? 'silver');
    //     $tierExpiredAt = $customer->tier_expired_at ? Carbon::parse($customer->tier_expired_at) : null;

    //     if (!$tierExpiredAt || $now->greaterThan($tierExpiredAt)) {
    //         $currentTier = MembershipTier::orderByDesc('min_point')->where('min_point', '<=', $point)->first();
    //         $tierKey = strtolower($currentTier?->key ?? 'silver');
    //         $tierExpiredAt = $now->copy()->addYears($currentTier?->duration_years ?? 2);
    //         $customer->update(['tier_key' => $tierKey, 'tier_updated_at' => $now, 'tier_expired_at' => $tierExpiredAt]);
    //     }

    //     // 3. ตรวจสอบเดือนเกิด
    //     $isBirthMonth = false;
    //     if (!empty($customer->cust_birthdate)) {
    //         try {
    //             $birthDate = Carbon::parse($customer->cust_birthdate);
    //             $isBirthMonth = $birthDate->month === $now->month;
    //         } catch (\Exception $e) {
    //         }
    //     }

    //     // 4. ดึงข้อมูล Rewards & Privileges (ของเดิม)
    //     $rewards = Reward::where('is_active', true)
    //         ->where(function ($q) use ($today) {
    //             $q->whereNull('start_date')->orWhereDate('start_date', '<=', $today);
    //         })
    //         ->where(function ($q) use ($today) {
    //             $q->whereNull('end_date')->orWhereDate('end_date', '>=', $today);
    //         })
    //         ->whereIn('visibility_settings', ['user', 'both'])
    //         ->get();

    //     $privileges = Privilege::where('is_active', true)
    //         ->where(function ($q) use ($today) {
    //             $q->whereNull('start_date')->orWhereDate('start_date', '<=', $today);
    //         })
    //         ->where(function ($q) use ($today) {
    //             $q->whereNull('end_date')->orWhereDate('end_date', '>=', $today);
    //         })
    //         ->whereIn('visibility_settings', ['user', 'both'])
    //         ->get();

    //     // ★★★ 4.1 ดึงข้อมูล Coupons (ของใหม่) ★★★
    //     $newCoupons = Coupons::where('is_active', true)
    //         ->where(function ($q) use ($today) {
    //             $q->whereNull('start_date')->orWhereDate('start_date', '<=', $today);
    //         })
    //         ->where(function ($q) use ($today) {
    //             $q->whereNull('end_date')->orWhereDate('end_date', '>=', $today);
    //         })
    //         ->get();

    //     $birthdayProcessConfig = TypeProcessPoint::where('process_code', 'BIRTHDAY')->where('is_active', 1)->first();

    //     // 5. Map Data Function
    //     $mapData = function ($item, $sourceType) use ($tierKey, $isBirthMonth, $birthdayProcessConfig) {

    //         // Handle กรณีเป็น Coupons จากตารางใหม่ (Structure ต่างกัน)
    //         if ($sourceType === 'new_coupon') {
    //             $groups = $item->member_group ?? [];
    //             $level = 1; // Default Silver
    //             // เช็ค Tier Level แบบง่ายๆ จาก member_group
    //             if (is_array($groups)) {
    //                 if (in_array('Platinum', $groups)) $level = 3;
    //                 elseif (in_array('Gold', $groups)) $level = 2;
    //             }

    //             return [
    //                 'pid' => $item->code, // ใช้ code เป็น pid สำหรับ redeem
    //                 'pname' => $item->name,
    //                 'image_url' => $item->image_url,
    //                 'tier_level' => $level,
    //                 'redeem_point' => 0, // คูปองใหม่ส่วนใหญ่แจกฟรี (หรือแก้เพิ่ม field ใน DB ถ้ามีคะแนน)
    //                 'earn_point' => 0,
    //                 'product_type' => 'coupon',
    //                 'remark' => $item->description,
    //                 'expired_at' => $item->end_date ? Carbon::parse($item->end_date)->toIso8601String() : null,
    //                 'expiry_type' => $item->expiry_mode === 'DYNAMIC' ? 'dynamic' : 'static',
    //                 'expiry_days' => $item->expiry_dynamic_value,
    //                 'usage_limit_type' => $item->quota_limit_user > 0 ? 'once' : 'unlimited',
    //                 'usage_limit_amount' => $item->quota_limit_user,
    //                 'delivery_type' => 'receive_at_store',
    //             ];
    //         }

    //         $itemCode = $sourceType === 'reward' ? $item->reward_code : $item->privilege_code;
    //         $itemId   = $sourceType === 'reward' ? $item->rewards_id : $item->privilege_code;
    //         $itemName = $sourceType === 'reward' ? $item->reward_name : $item->privilege_name;

    //         $isBirthdayItem = false;
    //         $earnPoint = 0;
    //         $redeemPoint = 0;

    //         if ($sourceType === 'privilege') {
    //             if (stripos($itemName, 'BIRTHDAY') !== false) {
    //                 if (!$isBirthMonth) return null;
    //                 $isBirthdayItem = true;
    //                 if ($birthdayProcessConfig) {
    //                     $earnPointField = "point_{$tierKey}";
    //                     $earnPoint = $birthdayProcessConfig->$earnPointField > 0 ? $birthdayProcessConfig->$earnPointField : ($birthdayProcessConfig->default_point ?? 0);
    //                 }
    //             }
    //         }
    //         // if (!$isBirthdayItem) {
    //         //     $pointField = "points_{$tierKey}";
    //         //     $redeemPoint = $item->$pointField;
    //         //     if (empty($redeemPoint)) {
    //         //         if ($tierKey === 'platinum') $redeemPoint = $item->points_gold;
    //         //         if (empty($redeemPoint)) $redeemPoint = $item->points_silver;
    //         //     }
    //         //     $redeemPoint = (int)($redeemPoint ?? 0);
    //         // }

    //         if (!$isBirthdayItem) {
    //             // 1. กำหนด Level เปรียบเทียบ
    //             $tierLevels = ['silver' => 1, 'gold' => 2, 'platinum' => 3];
    //             $userLevel = $tierLevels[$tierKey] ?? 1; // Level ของ User ปัจจุบัน

    //             // 2. หา Level ของสินค้า (Target Group)
    //             $targetGroupRaw = strtolower($item->member_group ?? 'all');
    //             $targetItemLevel = 1;
    //             if ($targetGroupRaw !== 'all' && isset($tierLevels[$targetGroupRaw])) {
    //                 $targetItemLevel = $tierLevels[$targetGroupRaw];
    //             }

    //             // 3. Logic เลือกราคา (Smart Price Selection)
    //             if ($userLevel < $targetItemLevel) {
    //                 // กรณี User Level ไม่ถึง (LOCKED) -> ให้แสดงราคาของ Tier สินค้านั้นๆ
    //                 // เช่น User Silver ดูของ Gold -> ให้โชว์ points_gold
    //                 $pointField = "points_{$targetGroupRaw}";
    //                 $redeemPoint = $item->$pointField;
    //             } else {
    //                 // กรณี User Level ถึงแล้ว -> ใช้ราคาตาม User Tier
    //                 $pointField = "points_{$tierKey}";
    //                 $redeemPoint = $item->$pointField;
    //             }

    //             // 4. Fallback: ถ้าดึงมาแล้วเป็น 0 หรือ null ให้ลองหาค่าที่มีอยู่จริงมาใส่ (กันการแสดงผล 0)
    //             if (empty($redeemPoint)) {
    //                 // ลองไล่ลำดับ priority หรือเอาค่าไหนก็ได้ที่ไม่ใช่ 0 มาโชว์
    //                 $redeemPoint = $item->points_silver ?? $item->points_gold ?? $item->points_platinum ?? 0;
    //             }

    //             $redeemPoint = (int)($redeemPoint ?? 0);
    //         }

    //         $tierLevels = ['silver' => 1, 'gold' => 2, 'platinum' => 3];
    //         $targetGroup = strtolower($item->member_group ?? 'all');
    //         $itemTierLevel = 1;
    //         if ($targetGroup !== 'all' && isset($tierLevels[$targetGroup])) {
    //             $itemTierLevel = $tierLevels[$targetGroup];
    //         }

    //         $limitType = 'unlimited';
    //         $limitAmount = 0;
    //         // ... (Logic Quota เดิม) ...
    //         if (isset($item->quota_limit_per_user) && $item->quota_limit_per_user > 0) {
    //             $limitType = 'once';
    //             $limitAmount = $item->quota_limit_per_user;
    //         }

    //         $productType = 'reward';
    //         if ($sourceType === 'reward') {
    //             if (in_array($item->category, ['voucher', 'coupon'])) $productType = 'coupon';
    //             else if ($item->category === 'privilege') $productType = 'privilege';
    //         } else {
    //             $productType = 'privilege';
    //         }

    //         return [
    //             'pid' => $itemId,
    //             'pname' => $itemName,
    //             'image_url' => $item->image_url,
    //             'tier_level' => $itemTierLevel,
    //             'redeem_point' => $redeemPoint,
    //             'earn_point' => (int)$earnPoint,
    //             'product_type' => $productType,
    //             'remark' => $item->description,
    //             'expired_at' => $item->end_date ? Carbon::parse($item->end_date)->toIso8601String() : null,
    //             'expiry_type' => 'static',
    //             'usage_limit_type' => $limitType,
    //             'usage_limit_amount' => $limitAmount,
    //             'delivery_type'     => $item->delivery_type ?? 'receive_at_store',
    //         ];
    //     };

    //     // 6. Execute Mapping
    //     $mappedRewards = $rewards->map(fn($i) => $mapData($i, 'reward'))->filter();
    //     $mappedPrivileges = $privileges->map(fn($i) => $mapData($i, 'privilege'))->filter();
    //     // Map คูปองใหม่
    //     $mappedNewCoupons = $newCoupons->map(fn($i) => $mapData($i, 'new_coupon'))->filter();

    //     // 7. Grouping (รวม Coupon ใหม่ เข้าไปใน Tab Coupon)
    //     $products = [
    //         'reward'    => $mappedRewards->where('product_type', 'reward')->values(),
    //         'coupon'    => $mappedRewards->where('product_type', 'coupon')->merge($mappedNewCoupons)->values(),
    //         'privilege' => $mappedPrivileges->values(),
    //     ];

    //     $tiers = MembershipTier::orderBy('level')->get(['key', 'name', 'min_point', 'level', 'duration_years']);
    //     $displayName = trim(($customer->cust_firstname ?? '') . ' ' . ($customer->cust_lastname ?? '')) ?: ($user->name ?? 'สมาชิก');

    //     return Inertia::render('Profile/Customer/Privilege', [
    //         'display_name'    => $displayName,
    //         'point'           => $point,
    //         'joined_at'       => $customer->datetime,
    //         'tier'            => $tierKey,
    //         'tier_expired_at' => $tierExpiredAt ? $tierExpiredAt->toIso8601String() : null,
    //         'line_avatar'     => $avatar,
    //         'products'        => $products,
    //         'tiers'           => $tiers,

    //         'customer_info' => [
    //             'fname'       => $customer->cust_firstname,
    //             'lname'       => $customer->cust_lastname,
    //             'tel'         => $customer->cust_tel,
    //             'address'     => $customer->cust_address, // หรือ cust_full_address แล้วแต่การเก็บ
    //             'subdistrict' => $customer->cust_subdistrict,
    //             'district'    => $customer->cust_district,
    //             'province'    => $customer->cust_province,
    //             'zipcode'     => $customer->cust_zipcode,
    //         ],
    //     ]);
    // }

    // private function renderEmptyPrivilege($user, $avatar)
    // {
    //     return Inertia::render('Profile/Customer/Privilege', [
    //         'display_name' => $user->name ?? 'สมาชิก',
    //         'point'        => 0,
    //         'joined_at'    => now()->toIso8601String(),
    //         'tier'         => 'silver',
    //         'line_avatar'  => $avatar,
    //         'products'     => ['reward' => [], 'privilege' => [], 'coupon' => []],
    //         'tiers'        => [],
    //     ]);
    // }

    public function index(TierService $tierService)
    {
        $user = Auth::user();
        $avatar = session('line_avatar') ?? $user->line_avatar ?? null;
        $now = Carbon::now();
        $today = $now->toDateString();

        // 1. ตรวจสอบข้อมูลลูกค้า
        if (empty($user->line_id)) return $this->renderEmptyPrivilege($user, $avatar);
        $customer = TblCustomerProd::where('cust_line', $user->line_id)->first();
        if (!$customer) return $this->renderEmptyPrivilege($user, $avatar);

        // -------------------------------------------------------------
        // 3. เรียกใช้ Service เพื่อคำนวณ Tier (Upgrade / Expire)
        // -------------------------------------------------------------
        $tierService->recalculate($customer);
        // -------------------------------------------------------------

        // 2. ดึงค่าล่าสุดหลังจากคำนวณเสร็จแล้ว
        $point = (int)($customer->point ?? 0);
        $tierKey = strtolower($customer->tier_key ?? 'silver');
        $tierExpiredAt = $customer->tier_expired_at ? Carbon::parse($customer->tier_expired_at) : null;

        // 3. ตรวจสอบเดือนเกิด
        $isBirthMonth = false;
        if (!empty($customer->cust_birthdate)) {
            try {
                $birthDate = Carbon::parse($customer->cust_birthdate);
                $isBirthMonth = $birthDate->month === $now->month;
            } catch (\Exception $e) {
            }
        }

        // 4. ดึงข้อมูล Rewards & Privileges (ของเดิม)
        $rewards = Reward::where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('start_date')->orWhereDate('start_date', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')->orWhereDate('end_date', '>=', $today);
            })
            ->whereIn('visibility_settings', ['user', 'both'])
            ->get();

        $privileges = Privilege::where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('start_date')->orWhereDate('start_date', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')->orWhereDate('end_date', '>=', $today);
            })
            ->whereIn('visibility_settings', ['user', 'both'])
            ->get();

        // 4.1 ดึงข้อมูล Coupons (ของใหม่) 
        $newCoupons = Coupons::where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('start_date')->orWhereDate('start_date', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')->orWhereDate('end_date', '>=', $today);
            })
            ->get();

        $birthdayProcessConfig = TypeProcessPoint::where('process_code', 'BIRTHDAY')->where('is_active', 1)->first();

        $hasClaimedBirthday = PointTransaction::where('line_id', $user->line_id)
            ->whereYear('trandate', $now->year)
            ->where('process_code', 'BIRTHDAY')
            ->exists();

        // 5. Map Data Function
        $mapData = function ($item, $sourceType) use ($tierKey, $isBirthMonth, $birthdayProcessConfig, $hasClaimedBirthday) {

            // Handle กรณีเป็น Coupons จากตารางใหม่ (Structure ต่างกัน)
            if ($sourceType === 'new_coupon') {
                $groups = $item->member_group ?? [];
                $level = 1; // Default Silver
                // เช็ค Tier Level แบบง่ายๆ จาก member_group
                if (is_array($groups)) {
                    if (in_array('Platinum', $groups)) $level = 3;
                    elseif (in_array('Gold', $groups)) $level = 2;
                }

                return [
                    'pid' => $item->code, // ใช้ code เป็น pid สำหรับ redeem
                    'pname' => $item->name,
                    'image_url' => $item->image_url,
                    'tier_level' => $level,
                    'redeem_point' => 0, // คูปองใหม่ส่วนใหญ่แจกฟรี (หรือแก้เพิ่ม field ใน DB ถ้ามีคะแนน)
                    'earn_point' => 0,
                    'product_type' => 'coupon',
                    'remark' => $item->description,
                    'expired_at' => $item->end_date ? Carbon::parse($item->end_date)->toIso8601String() : null,
                    'expiry_type' => $item->expiry_mode === 'DYNAMIC' ? 'dynamic' : 'static',
                    'expiry_days' => $item->expiry_dynamic_value,
                    'usage_limit_type' => $item->quota_limit_user > 0 ? 'once' : 'unlimited',
                    'usage_limit_amount' => $item->quota_limit_user,
                    'delivery_type' => 'receive_at_store',
                    'is_claimed' => false,
                ];
            }

            $itemCode = $sourceType === 'reward' ? $item->reward_code : $item->privilege_code;
            $itemId   = $sourceType === 'reward' ? $item->rewards_id : $item->privilege_code;
            $itemName = $sourceType === 'reward' ? $item->reward_name : $item->privilege_name;

            $isBirthdayItem = false;
            $earnPoint = 0;
            $redeemPoint = 0;
            $isClaimed = false;

            if ($sourceType === 'privilege') {
                if (stripos($itemName, 'BIRTHDAY') !== false) {
                    if (!$isBirthMonth) return null;
                    $isBirthdayItem = true;
                    if ($hasClaimedBirthday) {
                        $isClaimed = true;
                    }
                    if ($birthdayProcessConfig) {
                        $earnPointField = "point_{$tierKey}";
                        $earnPoint = $birthdayProcessConfig->$earnPointField > 0 ? $birthdayProcessConfig->$earnPointField : ($birthdayProcessConfig->default_point ?? 0);
                    }
                }
            }

            if (!$isBirthdayItem) {
                // 1. กำหนด Level เปรียบเทียบ
                $tierLevels = ['silver' => 1, 'gold' => 2, 'platinum' => 3];
                $userLevel = $tierLevels[$tierKey] ?? 1; // Level ของ User ปัจจุบัน

                // 2. หา Level ของสินค้า (Target Group)
                $targetGroupRaw = strtolower($item->member_group ?? 'all');
                $targetItemLevel = 1;
                if ($targetGroupRaw !== 'all' && isset($tierLevels[$targetGroupRaw])) {
                    $targetItemLevel = $tierLevels[$targetGroupRaw];
                }

                // 3. Logic เลือกราคา (Smart Price Selection)
                if ($userLevel < $targetItemLevel) {
                    // กรณี User Level ไม่ถึง (LOCKED) -> ให้แสดงราคาของ Tier สินค้านั้นๆ
                    // เช่น User Silver ดูของ Gold -> ให้โชว์ points_gold
                    $pointField = "points_{$targetGroupRaw}";
                    $redeemPoint = $item->$pointField;
                } else {
                    // กรณี User Level ถึงแล้ว -> ใช้ราคาตาม User Tier
                    $pointField = "points_{$tierKey}";
                    $redeemPoint = $item->$pointField;
                }

                // 4. Fallback: ถ้าดึงมาแล้วเป็น 0 หรือ null ให้ลองหาค่าที่มีอยู่จริงมาใส่ (กันการแสดงผล 0)
                if (empty($redeemPoint)) {
                    // ลองไล่ลำดับ priority หรือเอาค่าไหนก็ได้ที่ไม่ใช่ 0 มาโชว์
                    $redeemPoint = $item->points_silver ?? $item->points_gold ?? $item->points_platinum ?? 0;
                }

                $redeemPoint = (int)($redeemPoint ?? 0);
            }

            $tierLevels = ['silver' => 1, 'gold' => 2, 'platinum' => 3];
            $targetGroup = strtolower($item->member_group ?? 'all');
            $itemTierLevel = 1;
            if ($targetGroup !== 'all' && isset($tierLevels[$targetGroup])) {
                $itemTierLevel = $tierLevels[$targetGroup];
            }

            $limitType = 'unlimited';
            $limitAmount = 0;
            // ... (Logic Quota เดิม) ...
            if (isset($item->quota_limit_per_user) && $item->quota_limit_per_user > 0) {
                $limitType = 'once';
                $limitAmount = $item->quota_limit_per_user;
            }

            $productType = 'reward';
            if ($sourceType === 'reward') {
                if (in_array($item->category, ['voucher', 'coupon'])) $productType = 'coupon';
                else if ($item->category === 'privilege') $productType = 'privilege';
            } else {
                $productType = 'privilege';
            }

            return [
                'pid' => $itemId,
                'pname' => $itemName,
                'image_url' => $item->image_url,
                'tier_level' => $itemTierLevel,
                'redeem_point' => $redeemPoint,
                'earn_point' => (int)$earnPoint,
                'product_type' => $productType,
                'remark' => $item->description,
                'expired_at' => $item->end_date ? Carbon::parse($item->end_date)->toIso8601String() : null,
                'expiry_type' => 'static',
                'usage_limit_type' => $limitType,
                'usage_limit_amount' => $limitAmount,
                'delivery_type'     => $item->delivery_type ?? 'receive_at_store',
                'is_claimed'        => $isClaimed,
            ];
        };

        // 6. Execute Mapping
        $mappedRewards = $rewards->map(fn($i) => $mapData($i, 'reward'))->filter();
        $mappedPrivileges = $privileges->map(fn($i) => $mapData($i, 'privilege'))->filter();
        // Map คูปองใหม่
        $mappedNewCoupons = $newCoupons->map(fn($i) => $mapData($i, 'new_coupon'))->filter();

        // 7. Grouping (รวม Coupon ใหม่ เข้าไปใน Tab Coupon)
        $products = [
            'reward'    => $mappedRewards->where('product_type', 'reward')->values(),
            'coupon'    => $mappedRewards->where('product_type', 'coupon')->merge($mappedNewCoupons)->values(),
            'privilege' => $mappedPrivileges->values(),
        ];

        $tiers = MembershipTier::orderBy('level')->get(['key', 'name', 'min_point', 'level', 'duration_years']);
        $displayName = trim(($customer->cust_firstname ?? '') . ' ' . ($customer->cust_lastname ?? '')) ?: ($user->name ?? 'สมาชิก');

        $referralUrl = $customer->referral_code
            ? route('line.login', ['ref' => $customer->referral_code])
            : null;

        $orders = Order::where('line_id', $user->line_id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Profile/Customer/Privilege', [
            'display_name'    => $displayName,
            'point'           => $point,
            'joined_at'       => $customer->datetime,
            'tier'            => $tierKey,
            'tier_expired_at' => $tierExpiredAt ? $tierExpiredAt->toIso8601String() : null,
            'line_avatar'     => $avatar,
            'products'        => $products,
            'tiers'           => $tiers,
            'customer_code' => $customer->referral_code,
            'referral_url' => $referralUrl,
            'orders' => $orders,
            'customer_info' => [
                'fname'       => $customer->cust_firstname,
                'lname'       => $customer->cust_lastname,
                'tel'         => $customer->cust_tel,
                'address'     => $customer->cust_address, // หรือ cust_full_address แล้วแต่การเก็บ
                'subdistrict' => $customer->cust_subdistrict,
                'district'    => $customer->cust_district,
                'province'    => $customer->cust_province,
                'zipcode'     => $customer->cust_zipcode,

            ],
        ]);
    }

    private function renderEmptyPrivilege($user, $avatar)
    {
        return Inertia::render('Profile/Customer/Privilege', [
            'display_name' => $user->name ?? 'สมาชิก',
            'point'        => 0,
            'joined_at'    => now()->toIso8601String(),
            'tier'         => 'silver',
            'line_avatar'  => $avatar,
            'products'     => ['reward' => [], 'privilege' => [], 'coupon' => []],
            'tiers'        => [],
        ]);
    }

    public function myOrders(Request $request)
    {
        $user = Auth::user();

        // ดึง Order ของ User คนนี้ เรียงจากใหม่ไปเก่า
        $orders = Order::where('line_id', $user->line_id)
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Privilege/OrderTracking', [
            'orders' => $orders
        ]);
    }
}
