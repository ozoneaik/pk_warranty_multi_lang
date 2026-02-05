<?php

namespace App\Http\Controllers\Referral;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReferralController extends Controller
{
    //
    public function index()
    {
        $user = Auth::user();
        $customer = TblCustomerProd::where('cust_uid', $user->line_id)->first();

        // สร้างรหัสแนะนำถ้ายังไม่มี
        if (!$customer->referral_code) {
            $customer->update([
                'referral_code' => strtoupper(substr(md5($user->line_id), 0, 8))
            ]);
        }

        return Inertia::render('Profile/Customer/Referral/Referral', [
            'referral_code' => $customer->referral_code,
            'referral_url' => route('line.login', ['ref' => $customer->referral_code]),
        ]);
    }
}
