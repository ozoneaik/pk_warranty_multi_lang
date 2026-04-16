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

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Priority: line_id ก่อน fallback ด้วย phone
        $customer = null;
        if (!empty($user->line_id)) {
            $customer = TblCustomerProd::where('cust_line', $user->line_id)->first();
        }
        if (!$customer && !empty($user->phone)) {
            $customer = TblCustomerProd::where('cust_tel', $user->phone)->first();
        }

        if (!$customer) {
            return response()->json([
                'point'        => 0,
                'point_rocket' => 0,
            ]);
        }

        return response()->json([
            'point' => (int) $customer->point,
            'point_rocket' => (int) ($customer->point_rocket ?? 0),
        ]);
    }
}
