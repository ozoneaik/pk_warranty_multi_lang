<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WarrantyHomeController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $customer = TblCustomerProd::query()
            ->where(function ($q) use ($user) {
                if (!empty($user->line_id)) {
                    $q->where('cust_line', $user->line_id);
                }
                if (!empty($user->phone)) {
                    $q->orWhere('cust_tel', $user->phone);
                }
            })
            ->select('cust_firstname', 'cust_lastname', 'point', 'datetime')
            ->first();
        $point = $customer->point ?? 0;
        return Inertia::render('Warranty/WarrantyHome', [
            'point' => $point,
            'joined_at' => $customer->datetime ?? now(),
        ]);
    }
}