<?php

namespace App\Http\Controllers\Privilege;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\MembershipTier;
use App\Models\MasterWaaranty\ProductTier;
use App\Models\MasterWaaranty\TblCustomerProd;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PrivilegeController extends Controller
{

    // public function index()
    // {
    //     $user = Auth::user();
    //     // $avatar = $user->line_avatar ?? null;
    //     $avatar = session('line_avatar') ?? $user->line_avatar ?? null;

    //     if (empty($user->line_id)) {
    //         return Inertia::render('Profile/Customer/Privilege', [
    //             'display_name' => $user->name ?? 'สมาชิก',
    //             'point'        => 0,
    //             'joined_at'    => now()->toDateTimeString(),
    //             'tier'         => 'silver',
    //             'line_avatar'  => $avatar,
    //             'products'     => [],
    //         ]);
    //     }

    //     // ✅ ดึงข้อมูลลูกค้า
    //     $customer = TblCustomerProd::query()
    //         ->where('cust_line', $user->line_id)
    //         ->select(
    //             'cust_firstname',
    //             'cust_lastname',
    //             'point',
    //             'tier_key',
    //             'tier_expired_at',
    //             'datetime'
    //         )
    //         ->orderByDesc('datetime')
    //         ->first();

    //     if (!$customer) {
    //         return Inertia::render('Profile/Customer/Privilege', [
    //             'display_name' => $user->name ?? 'สมาชิก',
    //             'point'        => 0,
    //             'joined_at'    => now(),
    //             'tier'         => 'silver',
    //             'line_avatar'  => $avatar,
    //             'products'     => [],
    //         ]);
    //     }

    //     $displayName = trim(($customer->cust_firstname ?? '') . ' ' . ($customer->cust_lastname ?? ''))
    //         ?: ($user->name ?? 'สมาชิก');

    //     $point = (int) ($customer->point ?? 0);
    //     $joined_at = $customer->datetime ?? now();
    //     $now = Carbon::now();

    //     // ✅ ตรวจสอบ Tier หมดอายุหรือยัง
    //     $isExpired = !$customer->tier_expired_at || $now->greaterThan(Carbon::parse($customer->tier_expired_at));

    //     if ($isExpired) {
    //         $tier = match (true) {
    //             $point > 3000 => 'platinum',
    //             $point > 1000 => 'gold',
    //             default        => 'silver',
    //         };

    //         $tierExpiredAt = $now->copy()->addYears(2);

    //         $customer->update([
    //             'tier_key'        => $tier,
    //             'tier_updated_at' => $now,
    //             'tier_expired_at' => $tierExpiredAt,
    //         ]);
    //     } else {
    //         $tier = $customer->tier_key ?? 'silver';
    //     }

    //     $tierLevel = match ($tier) {
    //         'platinum' => 3,
    //         'gold'     => 2,
    //         default    => 1,
    //     };

    //     // ✅ ดึงสินค้าทั้งหมดตาม Tier
    //     $allProducts = ProductTier::visibleFor($tierLevel)
    //         ->orderBy('tier_level')
    //         ->get([
    //             'pid',
    //             'pname',
    //             'image_url',
    //             'tier_level',
    //             'redeem_point',
    //             'product_type',
    //         ]);

    //     // ✅ แยกตามประเภท
    //     $products = [
    //         'reward'    => $allProducts->where('product_type', 'reward')->values(),
    //         'privilege' => $allProducts->where('product_type', 'privilege')->values(),
    //         'coupon'    => $allProducts->where('product_type', 'coupon')->values(),
    //     ];

    //     return Inertia::render('Profile/Customer/Privilege', [
    //         'display_name' => $displayName,
    //         'point'        => $point,
    //         'joined_at'    => $joined_at,
    //         'tier'         => $tier,
    //         'line_avatar'  => $avatar,
    //         'products'     => $products,
    //     ]);
    // }

    public function index()
    {
        $user = Auth::user();
        $avatar = session('line_avatar') ?? $user->line_avatar ?? null;

        if (empty($user->line_id)) {
            return Inertia::render('Profile/Customer/Privilege', [
                'display_name' => $user->name ?? 'สมาชิก',
                'point'        => 0,
                'joined_at'    => now()->toDateTimeString(),
                'tier'         => 'silver',
                'line_avatar'  => $avatar,
                'products'     => [],
                'tiers'        => [],
            ]);
        }

        $customer = TblCustomerProd::query()
            ->where('cust_line', $user->line_id)
            ->select('cust_firstname', 'cust_lastname', 'point', 'tier_key', 'tier_expired_at', 'datetime')
            ->orderByDesc('datetime')
            ->first();

        if (!$customer) {
            return Inertia::render('Profile/Customer/Privilege', [
                'display_name' => $user->name ?? 'สมาชิก',
                'point'        => 0,
                'joined_at'    => now(),
                'tier'         => 'silver',
                'line_avatar'  => $avatar,
                'products'     => [],
                'tiers'        => [],
            ]);
        }

        $displayName = trim(($customer->cust_firstname ?? '') . ' ' . ($customer->cust_lastname ?? ''))
            ?: ($user->name ?? 'สมาชิก');
        $point = (int)($customer->point ?? 0);
        $joined_at = $customer->datetime ?? now();
        $now = Carbon::now();

        // ✅ ใช้ tier จากฐานข้อมูลก่อน
        $tierKey = $customer->tier_key ?? 'silver';
        $tierExpiredAt = $customer->tier_expired_at ? Carbon::parse($customer->tier_expired_at) : null;

        // ✅ ถ้า tier หมดอายุ → คำนวณใหม่ตามคะแนน
        if (!$tierExpiredAt || $now->greaterThan($tierExpiredAt)) {
            $currentTier = MembershipTier::orderByDesc('min_point')
                ->where('min_point', '<=', $point)
                ->first();

            $tierKey = $currentTier?->key ?? 'silver';
            $tierExpiredAt = $now->copy()->addYears($currentTier?->duration_years ?? 2);

            $customer->update([
                'tier_key'        => $tierKey,
                'tier_updated_at' => $now,
                'tier_expired_at' => $tierExpiredAt,
            ]);
        }

        // ✅ ใช้ tier ปัจจุบันจาก DB เพื่อดึงสินค้าตามระดับ
        $currentTierLevel = MembershipTier::where('key', $tierKey)->value('level') ?? 1;

        // ✅ ดึงสินค้าตาม tier level
        $allProducts = ProductTier::visibleFor($currentTierLevel)
            ->orderBy('tier_level')
            ->get(['pid', 'pname', 'image_url', 'tier_level', 'redeem_point', 'product_type']);

        $products = [
            'reward'    => $allProducts->where('product_type', 'reward')->values(),
            'privilege' => $allProducts->where('product_type', 'privilege')->values(),
            'coupon'    => $allProducts->where('product_type', 'coupon')->values(),
        ];

        $tiers = MembershipTier::orderBy('level')->get(['key', 'name', 'min_point', 'level', 'duration_years']);

        return Inertia::render('Profile/Customer/Privilege', [
            'display_name' => $displayName,
            'point'        => $point,
            'joined_at'    => $joined_at,
            'tier'         => $tierKey,
            'tier_expired_at' => $tierExpiredAt,
            'line_avatar'  => $avatar,
            'products'     => $products,
            'tiers'        => $tiers,
        ]);
    }
}