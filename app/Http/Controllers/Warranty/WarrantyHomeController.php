<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblCustomerProd;
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

    public function index()
    {
        $user = Auth::user();

        // ค้นหาข้อมูลลูกค้า
        $customer = TblCustomerProd::query()
            ->where(function ($q) use ($user) {
                if (!empty($user->line_id)) {
                    $q->where('cust_line', $user->line_id);
                }
                if (!empty($user->phone)) {
                    $q->orWhere('cust_tel', $user->phone);
                }
            })
            ->first(); // เปลี่ยนจาก select เป็น first เพื่อเอา Model มา update ได้

        // สร้าง Referral Code ถ้ายังไม่มี (Logic เดียวกับ ReferralController)
        if ($customer && !$customer->referral_code && !empty($user->line_id)) {
            $customer->update([
                'referral_code' => strtoupper(substr(md5($user->line_id), 0, 8))
            ]);
        }

        $point = $customer->point ?? 0;

        // สร้าง Link สำหรับ QR Code
        $referralUrl = $customer->referral_code
            ? route('line.login', ['ref' => $customer->referral_code])
            : null;

        return Inertia::render('Warranty/WarrantyHome', [
            'point' => $point,
            'joined_at' => $customer->datetime ?? now(),
            'referral_url' => $referralUrl, // ส่งตัวแปรนี้ไปหน้าบ้าน
            'customer_code' => $customer->referral_code ?? '-', // ส่งรหัสสมาชิกไปโชว์ด้วยก็ได้
        ]);
    }
}
