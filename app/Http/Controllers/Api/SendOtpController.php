<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendOtpController extends Controller
{
    // public function send(Request $request)
    // {
    //     $request->validate([
    //         'phone' => 'required|digits:10',
    //         'otp'   => 'required|digits:4',
    //     ]);

    //     $uri = env('SEND_OTP_URI');
    //     $account = env('SEND_OTP_ACCOUNT');
    //     $password = env('SEND_OTP_PASSWORD');
    //     $phone = $request->phone;
    //     $otp = $request->otp;

    //     $message = "รหัส OTP ของคุณคือ {$otp} (ใช้ได้ 30 วินาที)";

    //     $formData = [
    //         'ACCOUNT' => $account,
    //         'PASSWORD' => $password,
    //         'MOBILE' => $phone,
    //         'MESSAGE' => $message,
    //         'OPTION' => 'SEND_TYPE=General'
    //     ];

    //     try {
    //         $response = Http::asForm()->post($uri, $formData);
    //         $text = $response->body();

    //         return response()->json([
    //             'success' => true,
    //             'data' => $text
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    //New
    public function send(Request $request)
    {
        $request->validate([
            'phone' => 'required|digits:10',
            'otp'   => 'required|digits:4',
        ]);

        $user = Auth::user();
        $phone = $request->phone;

        // ✅ ตรวจสอบว่าเข้าสู่ระบบหรือไม่
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'กรุณาเข้าสู่ระบบก่อนทำรายการ'
            ], 401);
        }

        // ✅ ตรวจสอบเบอร์โทร
        if ($user->phone !== $phone) {
            $exists = TblCustomerProd::where('cust_tel', $phone)
                ->where(function ($q) use ($user) {
                    $q->where('cust_uid', $user->line_id ?? null)
                        ->orWhere('cust_uid', $user->google_id ?? null);
                })
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'เบอร์โทรไม่ตรงกับบัญชีที่เข้าสู่ระบบ'
                ], 403);
            }
        }

        // ✅ ส่ง OTP
        $uri = env('SEND_OTP_URI');
        $account = env('SEND_OTP_ACCOUNT');
        $password = env('SEND_OTP_PASSWORD');
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

            Log::info('📲 OTP ส่งเรียบร้อย', [
                'phone' => $phone,
                'user_id' => $user->id,
                'response' => $text
            ]);

            return response()->json([
                'success' => true,
                'data' => $text
            ]);
        } catch (\Exception $e) {
            Log::error('❌ ส่ง OTP ล้มเหลว', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    // public function send(Request $request)
    // {
    //     $request->validate([
    //         'phone' => 'required|digits:10',
    //         'otp'   => 'required|digits:4',
    //     ]);

    //     $user = Auth::user();
    //     $phone = $request->phone;
    //     $otp = $request->otp;

    //     // ✅ เก็บ OTP ไว้ใน session เพื่อใช้ตรวจตอน verify
    //     session([
    //         'otp_code' => $otp,
    //         'otp_phone' => $phone,
    //         'otp_expire_at' => now()->addMinutes(5),
    //     ]);

    //     // ส่ง SMS เหมือนเดิม
    //     $uri = env('SEND_OTP_URI');
    //     $formData = [
    //         'ACCOUNT' => env('SEND_OTP_ACCOUNT'),
    //         'PASSWORD' => env('SEND_OTP_PASSWORD'),
    //         'MOBILE' => $phone,
    //         'MESSAGE' => "รหัส OTP ของคุณคือ {$otp} (ใช้ได้ 5 นาที)",
    //         'OPTION' => 'SEND_TYPE=General'
    //     ];

    //     Http::asForm()->post($uri, $formData);

    //     return response()->json(['success' => true, 'message' => 'ส่ง OTP สำเร็จ']);
    // }

    public function verify(Request $request)
    {
        $request->validate(['otp' => 'required|digits:4']);

        $otpInput = $request->otp;
        $otpSession = session('otp_code');
        $otpExpire = session('otp_expire_at');

        if (!$otpSession || now()->greaterThan($otpExpire)) {
            return response()->json(['success' => false, 'message' => 'OTP หมดอายุ'], 400);
        }

        if ($otpInput !== $otpSession) {
            return response()->json(['success' => false, 'message' => 'OTP ไม่ถูกต้อง'], 400);
        }

        // ✅ ถ้าถูกต้อง เคลียร์ session
        session()->forget(['otp_code', 'otp_phone', 'otp_expire_at']);

        return response()->json(['success' => true, 'message' => 'ยืนยัน OTP สำเร็จ']);
    }
}