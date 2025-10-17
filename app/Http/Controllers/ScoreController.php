<?php

namespace App\Http\Controllers;

use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScoreController extends Controller
{
    //
    public function getPoint()
    {
        $user = Auth::user();
        $customer = TblCustomerProd::where('cust_line', $user->line_id)
            ->orWhere('cust_tel', $user->phone)
            ->first();

        return response()->json([
            'point' => $customer->point ?? 0,
            'point_rocket' => $customer->point_rocket ?? 0,
        ]);
    }
}
