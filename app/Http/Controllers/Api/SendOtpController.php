<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SendOtpController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'phone' => 'required|digits:10',
            'otp'   => 'required|digits:4',
        ]);

        $uri = env('SEND_OTP_URI');
        $account = env('SEND_OTP_ACCOUNT');
        $password = env('SEND_OTP_PASSWORD');
        $phone = $request->phone;
        $otp = $request->otp;

        $message = "รหัส OTP ของคุณคือ {$otp} (ใช้ได้ 30 วินาที)";

        $formData = [
            'ACCOUNT' => $account,
            'PASSWORD' => $password,
            'MOBILE' => $phone,
            'MESSAGE' => $message,
            'OPTION' => 'SEND_TYPE=General'
        ];

        try {
            $response = Http::asForm()->post($uri, $formData);
            $text = $response->body();

            return response()->json([
                'success' => true,
                'data' => $text
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
