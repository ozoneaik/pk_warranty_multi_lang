<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\ReferralHistory;
use App\Models\MasterWaaranty\TypeProcessPoint;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocialRegisterController extends Controller
{
    public function showRegistrationForm()
    {
        if (!session()->has('social_register_data')) {
            return redirect()->route('login');
        }
        $data = session('social_register_data');
        return view('auth.complete-profile', compact('data'));
    }

    // ฟังก์ชันช่วยจัด Format เบอร์โทร (ไทยใช้ 08xx, ต่างชาติใช้ +xx)
    private function normalizePhone($phone)
    {
        if (strpos($phone, '+66') === 0) {
            return '0' . substr($phone, 3);
        }
        return $phone;
    }

    // private function canSkipOtp(): bool
    // {
    //     // ถ้า SKIP_OTP = false => skip จริง
    //     return !env('SKIP_OTP', true);
    // }
    private function isOtpVerificationEnabled(): bool
    {
        // Default คือ false (ไม่ข้าม = ต้องตรวจ)
        return !env('SKIP_OTP', false);
    }

    // public function sendOtp(Request $request)
    // {
    //     if (!session()->has('social_register_data')) {
    //         return response()->json(['success' => false, 'message' => 'Session expired'], 401);
    //     }

    //     $sessionData = session('social_register_data');
    //     $lineId = $sessionData['line_id']; // ดึง Line ID ของคนปัจจุบัน

    //     $request->validate([
    //         'phone' => 'required',
    //     ]);

    //     $rawPhone = $request->phone;
    //     $dbPhone = $this->normalizePhone($rawPhone);

    //     // 1. เช็คว่ามีเบอร์นี้ในระบบหรือยัง 
    //     $exists = TblCustomerProd::where('cust_tel', $dbPhone)
    //         ->where('cust_uid', '!=', $lineId) // ถ้าเป็นเบอร์ของตัวเอง ให้ผ่านได้
    //         ->exists();

    //     if ($exists) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'เบอร์โทรศัพท์นี้มีผู้ใช้งานท่านอื่นใช้แล้วในระบบ'
    //         ], 422);
    //     }

    //     // --- Credit Check Logic ---
    //     try {
    //         $creditCheckUrl = 'http://192.168.9.32:9000/api/check-credit-lk.php';
    //         $creditResponse = Http::timeout(2)->get($creditCheckUrl, ['system_name' => 'Warranty Register']);
    //         if ($creditResponse->successful()) {
    //             Log::info("SMS Credit Check [Success]:", ['body' => $creditResponse->json()]);
    //         }
    //     } catch (\Exception $e) {
    //         Log::error("SMS Credit Check [Failed]: " . $e->getMessage());
    //     }
    //     // --------------------------

    //     $otp = rand(1000, 9999);
    //     $smsPhone = str_replace('+', '', $rawPhone);

    //     $uri = env('SEND_OTP_URI');
    //     $formData = [
    //         'ACCOUNT'  => env('SEND_OTP_ACCOUNT'),
    //         'PASSWORD' => env('SEND_OTP_PASSWORD'),
    //         'MOBILE'   => $smsPhone,
    //         'MESSAGE'  => "รหัส OTP ลงทะเบียนของคุณคือ {$otp} (ใช้ได้ 5 นาที)",
    //         'OPTION'   => 'SEND_TYPE=General'
    //     ];

    //     try {
    //         $response = Http::asForm()->post($uri, $formData);
    //         Log::info("Request OTP for {$smsPhone}: {$otp}", ['api_response' => $response->body()]);

    //         if ($this->canSkipOtp()) {
    //             session([
    //                 'register_otp' => (string)$otp,
    //                 'register_otp_phone' => $rawPhone,
    //                 'register_otp_db_format' => $dbPhone,
    //                 'register_otp_expire' => now('Asia/Bangkok')->addMinutes(5),
    //             ]);

    //             return response()->json([
    //                 'success' => true,
    //                 'message' => 'ส่งรหัส OTP เรียบร้อยแล้ว'
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         Log::error('Send OTP Failed: ' . $e->getMessage());
    //         return response()->json(['success' => false, 'message' => 'ส่ง OTP ไม่สำเร็จ'], 500);
    //     }
    // }

    public function sendOtp(Request $request)
    {
        if (!session()->has('social_register_data')) {
            return response()->json(['success' => false, 'message' => 'Session expired'], 401);
        }

        $sessionData = session('social_register_data');
        $lineId = $sessionData['line_id'];

        $request->validate([
            'phone' => 'required',
        ]);

        $rawPhone = $request->phone; // รูปแบบ +668xxxxxxx
        $dbPhone = $this->normalizePhone($rawPhone); // รูปแบบ 08xxxxxxx

        // 1. ตรวจสอบเบอร์ซ้ำ (ยกเว้นเบอร์ตัวเอง)
        $exists = TblCustomerProd::where('cust_tel', $dbPhone)
            ->where('cust_uid', '!=', $lineId)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'เบอร์โทรศัพท์นี้ถูกใช้งานโดยสมาชิกท่านอื่นแล้ว'
            ], 422);
        }

        // --- Credit Check Logic ---
        try {
            $creditCheckUrl = 'http://192.168.9.32:9000/api/check-credit-lk.php';
            $creditResponse = Http::timeout(2)->get($creditCheckUrl, ['system_name' => 'ระบบลงทะเบียนรับประกันสินค้าออนไลน์พัมคิน']);
            if ($creditResponse->successful()) {
                Log::info("SMS Credit Check [Success]:", ['body' => $creditResponse->json()]);
            }
        } catch (\Exception $e) {
            Log::error("SMS Credit Check [Failed]: " . $e->getMessage());
        }

        // 2. สร้างรหัส OTP
        $otp = (string)rand(1000, 9999);
        $smsPhone = str_replace('+', '', $rawPhone); // สำหรับ API ส่ง SMS มักไม่ใช้เครื่องหมาย +

        // 3. บันทึกข้อมูลลง Session เตรียมไว้ตรวจสอบตอนกด Submit
        session([
            'register_otp' => $otp,
            'register_otp_phone' => $rawPhone,
            'register_otp_db_format' => $dbPhone,
            'register_otp_expire' => now('Asia/Bangkok')->addMinutes(5),
        ]);

        // 4. ส่ง SMS จริง (ปิดโหมด Skip)
        try {
            $uri = env('SEND_OTP_URI');
            $response = Http::asForm()->post($uri, [
                'ACCOUNT'  => env('SEND_OTP_ACCOUNT'),
                'PASSWORD' => env('SEND_OTP_PASSWORD'),
                'MOBILE'   => $smsPhone,
                'MESSAGE'  => "รหัส OTP ของคุณคือ {$otp} (ใช้ได้ภายใน 5 นาที)",
                'OPTION'   => 'SEND_TYPE=General'
            ]);

            Log::info("OTP Sent to {$smsPhone}", ['response' => $response->body(), 'otp_debug' => $otp]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'ส่งรหัส OTP เรียบร้อยแล้ว'
                ]);
            } else {
                throw new \Exception('SMS Gateway Error: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Send OTP Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ไม่สามารถส่ง OTP ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // 1. ตรวจสอบ Session
        if (!session()->has('social_register_data')) {
            return redirect()->route('login');
        }

        $socialData = session('social_register_data');
        $lineId = $socialData['line_id'];

        // 2. รับค่า TimeZone
        $timezone = $request->input('timezone', 'Asia/Bangkok');
        $isThailand = ($timezone === 'Asia/Bangkok');

        // 3. Validation
        $rules = [
            'cust_firstname' => 'required|string|max:255',
            'cust_lastname'  => 'required|string|max:255',
            'cust_gender'    => 'required',
            'cust_email'     => 'required|email|max:255',
            'cust_birthdate' => 'required|date',
            'cust_tel'       => 'required',
            'cust_address'     => 'required|string|max:255',
            'cust_province'    => 'required|string',
            'cust_district'    => 'required|string',
            'cust_subdistrict' => 'required|string',
            'cust_zipcode'     => 'required|string',
        ];

        if ($isThailand  && $this->isOtpVerificationEnabled()) {
            $rules['otp'] = 'required|digits:4';
        }

        $request->validate($rules);

        // 4. Logic OTP
        $phoneToSave = '';
        if ($isThailand && $this->isOtpVerificationEnabled()) {
            $sessionOtp = session('register_otp');
            $sessionPhone = session('register_otp_phone');
            $sessionDbFormat = session('register_otp_db_format');
            $sessionExpire = session('register_otp_expire');

            if (!$sessionExpire || now('Asia/Bangkok')->greaterThan($sessionExpire)) {
                return back()->withInput()->withErrors(['otp' => 'รหัส OTP หมดอายุ กรุณากดส่งใหม่']);
            }
            if ($request->cust_tel !== $sessionPhone) {
                return back()->withInput()->withErrors(['cust_tel' => 'เบอร์โทรศัพท์ไม่ตรงกับที่ขอรหัส OTP']);
            }
            if ($request->otp !== $sessionOtp) {
                return back()->withInput()->withErrors(['otp' => 'รหัส OTP ไม่ถูกต้อง']);
            }

            $phoneToSave = $sessionDbFormat;
        } else {
            $phoneToSave = $this->normalizePhone($request->cust_tel);
        }

        // 5. Unique Check
        $duplicateEmail = TblCustomerProd::where('cust_email', $request->cust_email)
            ->where('cust_uid', '!=', $lineId)->exists();
        if ($duplicateEmail) {
            return back()->withInput()->withErrors(['cust_email' => 'อีเมลนี้มีผู้ใช้งานแล้ว']);
        }

        $duplicatePhone = TblCustomerProd::where('cust_tel', $phoneToSave)
            ->where('cust_uid', '!=', $lineId)->exists();
        if ($duplicatePhone) {
            return back()->withInput()->withErrors(['cust_tel' => 'เบอร์โทรศัพท์นี้มีผู้ใช้งานแล้ว']);
        }

        try {
            DB::beginTransaction();

            // 6. User (Laravel Auth)
            $user = User::updateOrCreate(
                ['line_id' => $lineId],
                [
                    'name'     => $this->removeEmoji($request->cust_firstname . ' ' . $request->cust_lastname),
                    'email'    => $request->cust_email,
                    'password' => Hash::make($lineId),
                    'phone'    => $phoneToSave,
                ]
            );

            // 7. Customer Data (แก้ Logic ตรงนี้)
            // ใช้ firstOrNew เพื่อเตรียม Object ก่อน save จะได้ไม่ติด error 1364
            $cust = TblCustomerProd::firstOrNew(['cust_uid' => $lineId]);

            // กำหนดค่าทั่วไปที่จะอัปเดตเสมอ
            $cust->cust_firstname = $this->removeEmoji($request->cust_firstname);
            $cust->cust_lastname  = $this->removeEmoji($request->cust_lastname);
            $cust->cust_gender    = $request->cust_gender;
            $cust->cust_email     = $request->cust_email;
            $cust->cust_birthdate = $request->cust_birthdate;
            $cust->cust_tel       = $phoneToSave;
            $cust->cust_address     = $request->cust_address;
            $cust->cust_province    = $request->cust_province;
            $cust->cust_district    = $request->cust_district;
            $cust->cust_subdistrict = $request->cust_subdistrict;
            $cust->cust_zipcode     = $request->cust_zipcode;
            $cust->cust_full_address = "{$request->cust_address} แขวง/ตำบล {$request->cust_subdistrict} เขต/อำเภอ {$request->cust_district} จังหวัด {$request->cust_province} {$request->cust_zipcode}";

            $cust->cust_line = $lineId;
            $cust->cust_type = 'line';
            $cust->cust_prefix = 'mr';
            $cust->status = 'enabled';
            // $cust->datetime = now(); 
            if (!$cust->datetime) {
                $cust->datetime = now();
            }

            // **[จุดสำคัญที่แก้ Error]**
            // ถ้าเป็น User ใหม่ ($cust->exists เป็น false) ให้กำหนดค่า Default Field ที่บังคับ (NOT NULL)
            if (!$cust->exists) {
                // Generate ค่าบังคับก่อน Save
                $cust->unlockkey     = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $cust->referral_code = strtoupper(substr(md5($lineId . time()), 0, 8));
                $cust->cre_key       = now();

                // Set Default Consents
                $cust->accept_news         = 'N';
                $cust->accept_policy       = 'N';
                $cust->accept_pdpa         = 'N';
                $cust->accept_analyze_prod = 'N';
                $cust->accept_marketing    = 'N';
            }

            // สั่ง Save ทีเดียว (Insert หรือ Update จะทำงานตรงนี้)
            $cust->save();

            // 8. Referral Logic (ถ้ามี)
            if (session()->has('referrer_code') && empty($cust->referred_by)) {
                $refCode = session('referrer_code');
                $referrer = TblCustomerProd::where('referral_code', $refCode)->first();
                // ต้องไม่ใช่ตัวเองแนะนำตัวเอง
                if ($referrer && $referrer->cust_uid !== $lineId) {
                    $cust->update(['referred_by' => $referrer->cust_uid]);
                    $this->processReferralReward($referrer, $lineId, $user->name);
                }
            }

            // 9. Award First Registration Points
            // เช็คจาก Transaction ชัวร์กว่า wasRecentlyCreated เพราะบางที User เก่า Login แต่ไม่มี Transaction
            $hasRegisteredPoint = PointTransaction::where('line_id', $lineId)
                ->where('process_code', 'REGISTER')
                ->exists();

            if (!$hasRegisteredPoint) {
                $this->awardFirstRegistrationPoints($cust, $lineId);
            }

            DB::commit();

            // 10. Login & Log
            $logType = $cust->wasRecentlyCreated ? 'new_register' : 'update_profile';
            if (!empty($socialData['is_update_mode'])) {
                $logType = 'update_profile_inactive_user';
            }

            LoginLog::create([
                'user_id'    => $user->id,
                'line_id'    => $lineId,
                'status'     => 'success',
                'login_at'   => now(),
                'metadata'   => [
                    'type' => $logType,
                    'timezone' => $timezone,
                    'skip_otp' => !$isThailand
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            Auth::login($user);

            // Clear Session
            session()->forget([
                'social_register_data',
                'referrer_code',
                'after_login_redirect',
                'register_otp',
                'register_otp_phone',
                'register_otp_expire',
                'register_otp_db_format'
            ]);

            session(['line_avatar' => $socialData['avatar'], 'line_email' => $request->cust_email]);
            return redirect()->to(session('after_login_redirect') ?? '/dashboard');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Complete Profile Error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'เกิดข้อผิดพลาด: ' . $e->getMessage());
        }
    }

    // --- Helper Methods ---
    private function awardFirstRegistrationPoints($cust, $lineId)
    {
        $process = TypeProcessPoint::where('process_code', 'REGISTER')->where('is_active', 1)->first();
        $initialPoint = $process?->default_point ?? 50;

        $cust->update([
            'point'           => $initialPoint,
            'tier_key'        => 'silver',
            'tier_updated_at' => now(),
            'tier_expired_at' => now()->addYears(2),
            'last_earn_at'    => now(),
        ]);

        PointTransaction::create([
            'line_id'          => $lineId,
            'transaction_type' => 'earn',
            'process_code'     => 'REGISTER',
            'pname'            => 'สมัครสมาชิกครั้งแรก',
            'point_before'     => 0,
            'point_tran'       => $initialPoint,
            'point_after'      => $initialPoint,
            'tier'             => 'silver',
            'docdate'          => now()->toDateString(),
            'trandate'         => now()->toDateString(),
            'docno'            => 'REG-' . now()->format('YmdHis'),
            'created_at'       => now(),
            'expired_at'       => now()->addYears(2)->toDateString(),
        ]);
    }

    private function processReferralReward($referrer, $refereeUid, $refereeName)
    {
        // 1. Create History
        $refHistory = ReferralHistory::create([
            'referrer_uid'    => $referrer->cust_uid,
            'referrer_name'   => $referrer->cust_firstname,
            'referee_uid'     => $refereeUid,
            'referee_name'    => $refereeName,
            'process_code'    => 'FRIEND_REFERRAL',
            'registered_at'   => now(),
            'status_referrer' => 'pending',
            'status_referee'  => 'rewarded',
        ]);

        // 2. Give Points to Referrer
        $master = TypeProcessPoint::where('process_code', 'FRIEND_REFERRAL')->where('is_active', 1)->first();
        if ($master) {
            $pointEarn = match ($referrer->tier_key) {
                'platinum' => $master->point_platinum,
                'gold'     => $master->point_gold,
                'silver'   => $master->point_silver,
                default    => $master->default_point,
            };

            $pointBefore = $referrer->point;
            $referrer->increment('point', $pointEarn);

            PointTransaction::create([
                'line_id'          => $referrer->cust_uid,
                'transaction_type' => 'earn',
                'process_code'     => 'FRIEND_REFERRAL',
                'reference_id'     => $refHistory->id,
                'pname'            => 'แนะนำเพื่อนสำเร็จ: ' . $refereeName,
                'point_before'     => $pointBefore,
                'point_tran'       => $pointEarn,
                'point_after'      => $pointBefore + $pointEarn,
                'tier'             => $referrer->tier_key,
                'docdate'          => now()->toDateString(),
                'trandate'         => now()->toDateString(),
                'docno'            => 'REF-' . now()->format('YmdHis'),
                'created_at'       => now(),
            ]);

            $refHistory->update(['status_referrer' => 'rewarded', 'points_referrer' => $pointEarn]);
        }
    }

    private function removeEmoji($text)
    {
        return preg_replace('/[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]/u', '', $text);
    }
}
