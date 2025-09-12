<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function updatePhone(Request $request)
    {
        $phone = $request['phone'];
        if (isset($phone)) {
            $user = User::updateOrCreate(
                ['id' => Auth::id()],
                ['phone' => $phone]
            );
            return redirect()->route('dashboard');
        } else {
            dd('ไม่พบเบอร์โทรลุกค้า');
        }
    }
}
