<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Services\TierService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WarrantyHomeController extends Controller
{
    // public function index()
    // {
    //     $user = Auth::user();
    //     $customer = TblCustomerProd::query()
    //         ->where(function ($q) use ($user) {
    //             if (!empty($user->line_id)) {
    //                 $q->where('cust_line', $user->line_id);
    //             }
    //             if (!empty($user->phone)) {
    //                 $q->orWhere('cust_tel', $user->phone);
    //             }
    //         })
    //         ->select('cust_firstname', 'cust_lastname', 'point', 'datetime')
    //         ->first();
    //     $point = $customer->point ?? 0;
    //     return Inertia::render('Warranty/WarrantyHome', [
    //         'point' => $point,
    //         'joined_at' => $customer->datetime ?? now(),
    //     ]);
    // }

    public function index(TierService $tierService)
    {
        $user = Auth::user();

        $customer = null;

        if (!empty($user->line_id)) {
            $customer = TblCustomerProd::where('cust_line', $user->line_id)->first();
        }

        if (!$customer && !empty($user->phone)) {
            $customer = TblCustomerProd::where('cust_tel', $user->phone)->first();
        }

        if (!$customer) {
            session([
                'social_register_data' => [
                    'provider' => 'line',
                    'line_id'  => $user->line_id,
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'avatar'   => session('line_avatar') ?? $user->line_avatar ?? null,
                ]
            ]);
            return redirect()->route('register.step1')
                ->with('error', 'ไม่พบข้อมูลสมาชิก กรุณาลงทะเบียนใหม่');
        }

        if ($customer && !$customer->referral_code && !empty($user->line_id)) {
            $customer->update([
                'referral_code' => strtoupper(substr(md5($user->line_id), 0, 8))
            ]);
        }

        // คำนวณ Tier ล่าสุด (เหมือน PrivilegeController)
        if ($customer) {
            $tierService->recalculate($customer);
            $customer->refresh();
        }

        $point = $customer->point ?? 0;
        $tierKey = strtolower($customer->tier_key ?? 'silver');

        $referralUrl = $customer?->referral_code
            ? route('line.login', ['ref' => $customer->referral_code])
            : null;

        $latestEarn = null;
        if ($customer) {
            $latestEarn = PointTransaction::where('line_id', $user->line_id)
                ->where('transaction_type', 'earn')
                ->where('point_tran', '>', 0)
                ->orderByDesc('trandate')
                ->value('trandate');
        }
        $pointExpiryDate = $latestEarn
            ? Carbon::parse($latestEarn)->addYear()->format('d/m/Y')
            : null;

        return Inertia::render('Warranty/WarrantyHome', [
            'point'             => $point,
            'tier'              => $tierKey,
            'joined_at'         => $customer->datetime ?? now(),
            'referral_url'      => $referralUrl,
            'customer_code'     => $customer->referral_code ?? '-',
            'customer_name'     => trim(($customer->cust_firstname ?? '') . ' ' . ($customer->cust_lastname ?? '')),
            'point_expiry_date' => $pointExpiryDate,
            'line_avatar'       => session('line_avatar') ?? $user->line_avatar ?? null,
        ]);
    }
}
