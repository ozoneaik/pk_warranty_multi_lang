<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\ReferralHistory;
use App\Models\MasterWaaranty\TypeProcessPoint;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\LoginLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocialRegisterController extends Controller
{

    public function showStep1()
    {
        if (!session()->has('social_register_data')) {
            return redirect()->route('login');
        }

        $socialData = session('social_register_data');
        $lineId     = $socialData['line_id'];

        // ป้องกันการสมัครซ้ำ: ถ้ามีข้อมูลใน TblCustomerProd แล้ว และไม่ได้อยู่ในโหมด Update Profile
        // ให้ส่งไปหน้า Dashboard เลย (หากสมัครเสร็จแล้ว)
        if (empty($socialData['is_update_mode'])) {
            $isExists = TblCustomerProd::where('cust_uid', $lineId)->where('status', 'enabled')->exists();
            if ($isExists) {
                // พยายามหาก่อนว่ามี User row หรือยัง ถ้ามีให้ล็อกอินเลยเพื่อความชัวร์
                $user = User::where('line_id', $lineId)->first();
                if ($user) {
                    Auth::login($user);
                }
                return redirect()->to('/dashboard');
            }
        }

        $data = $socialData;
        return view('auth.register.step1-user-type', compact('data'));
    }

    public function storeStep1(Request $request)
    {
        if (!session()->has('social_register_data')) {
            return redirect()->route('login');
        }

        $socialData = session('social_register_data');
        Log::channel('register')->info('📝 [Register] storeStep1 เริ่มต้น', [
            'line_id'          => $socialData['line_id'] ?? null,
            'crm_user_type_id' => $request->crm_user_type_id,
        ]);

        $request->validate([
            'crm_user_type_id' => 'required|integer|in:1,2,3,4',
        ], [
            'crm_user_type_id.required' => 'กรุณาเลือกประเภทผู้ใช้งาน',
            'crm_user_type_id.in'       => 'ประเภทผู้ใช้งานไม่ถูกต้อง',
        ]);

        // บันทึกลง Session 
        session(['register_step1' => [
            'crm_user_type_id' => (int) $request->crm_user_type_id,
        ]]);

        // [เพิ่มใหม่] ประทับตราว่าผ่าน Step 1 อย่างถูกต้องแล้ว
        session(['step1_passed' => true]);

        Log::channel('register')->info('✅ [Register] storeStep1 สำเร็จ → ไป Step 2', ['line_id' => $socialData['line_id'] ?? null]);
        return redirect()->route('register.step2');
    }


    // STEP 2 — กรอกข้อมูลส่วนตัว + OTP
    public function showStep2()
    {
        if (!session()->has('social_register_data') || !session('step1_passed')) {
            return redirect()->route('register.step1');
        }

        $data = session('social_register_data');
        if ($prev = session('register_step2')) {
            $data = array_merge($data, $prev);
        }

        return view('auth.register.step2-profile', compact('data'));
    }

    public function storeStep2(Request $request)
    {
        if (!session()->has('social_register_data') || !session('step1_passed')) {
            return redirect()->route('register.step1');
        }

        $socialData = session('social_register_data');
        $lineId     = $socialData['line_id'];

        Log::channel('register')->info('📝 [Register] storeStep2 เริ่มต้น', [
            'line_id'        => $lineId,
            'cust_firstname' => $request->cust_firstname,
            'cust_tel'       => $request->cust_tel,
            'has_email'      => !empty($request->cust_email),
        ]);
        $timezone   = $request->input('timezone', 'Asia/Bangkok');
        $isThailand = ($timezone === 'Asia/Bangkok');

        // Validation rules
        $rules = [
            'cust_firstname' => 'required|string|max:255',
            'cust_lastname'  => 'required|string|max:255',
            'cust_gender'    => 'required|in:male,female,other',
            'cust_email'     => 'nullable|email|max:255',
            'cust_birthdate' => 'required|date',
            'cust_tel'       => 'required',
        ];
        if ($isThailand && $this->isOtpVerificationEnabled()) {
            $rules['otp'] = 'required|digits:4';
        }
        $request->validate($rules, [
            'cust_firstname.required' => 'กรุณากรอกชื่อจริง',
            'cust_lastname.required'  => 'กรุณากรอกนามสกุล',
            'cust_gender.required'    => 'กรุณาเลือกเพศ',
            'cust_gender.in'          => 'ข้อมูลเพศไม่ถูกต้อง',
            'cust_email.email'        => 'รูปแบบอีเมลไม่ถูกต้อง',
            'cust_birthdate.required' => 'กรุณาเลือกวันเกิด',
            'cust_birthdate.date'     => 'รูปแบบวันที่ไม่ถูกต้อง',
            'cust_tel.required'       => 'กรุณากรอกเบอร์โทรศัพท์',
            'otp.required'            => 'กรุณากรอกรหัส OTP',
            'otp.digits'              => 'รหัส OTP ต้องเป็นตัวเลข 4 หลัก',
        ]);

        if (!empty($request->cust_email)) {
            $duplicateEmailProd = TblCustomerProd::where('cust_email', $request->cust_email)
                ->where('cust_uid', '!=', $lineId)->exists();

            $duplicateEmailUser = User::where('email', $request->cust_email)
                ->where('line_id', '!=', $lineId)->exists();

            if ($duplicateEmailProd || $duplicateEmailUser) {
                return back()->withInput()->withErrors(['cust_email' => 'อีเมลนี้มีผู้ใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น']);
            }
        }

        // ตรวจสอบ OTP
        $phoneToSave = '';
        if ($isThailand && $this->isOtpVerificationEnabled()) {
            $sessionOtp = session('register_otp');
            $sessionPhone = session('register_otp_phone');
            $sessionDbFormat = session('register_otp_db_format');
            $sessionExpire = session('register_otp_expire');

            if (!$sessionExpire || now('Asia/Bangkok')->greaterThan($sessionExpire)) {
                return back()->withInput()->withErrors(['otp' => 'รหัส OTP หมดอายุ กรุณากดส่งใหม่']);
            }
            if ($request->otp !== $sessionOtp) {
                return back()->withInput()->withErrors(['otp' => 'รหัส OTP ไม่ถูกต้อง']);
            }

            // [SECURITY] ตรวจสอบว่าเบอร์ปัจจุบันตรงกับเบอร์ที่ขอ OTP หรือไม่ (ป้องกัน user แก้เบอร์หลังขอ OTP)
            $submittedPhone = $this->normalizePhone($request->cust_tel);
            if ($submittedPhone !== $sessionDbFormat) {
                return back()->withInput()->withErrors(['cust_tel' => 'เบอร์โทรศัพท์มีการเปลี่ยนแปลงหลังจากขอ OTP กรุณากดส่งรหัสใหม่อีกครั้ง']);
            }

            $phoneToSave = $sessionDbFormat;
        } else {
            $phoneToSave = $this->normalizePhone($request->cust_tel);
        }

        // ตรวจซ้ำ Phone
        $duplicatePhone = TblCustomerProd::where('cust_tel', $phoneToSave)
            ->where('cust_uid', '!=', $lineId)->exists();
        if ($duplicatePhone) {
            return back()->withInput()->withErrors(['cust_tel' => 'เบอร์โทรศัพท์นี้มีผู้ใช้งานแล้ว']);
        }

        // บันทึก Step 2 ลง Session
        session(['register_step2' => [
            'cust_firstname' => $this->removeEmoji($request->cust_firstname),
            'cust_lastname'  => $this->removeEmoji($request->cust_lastname),
            'cust_gender'    => $request->cust_gender,
            'cust_email'     => $request->cust_email,
            'cust_birthdate' => $request->cust_birthdate,
            'cust_tel'       => $phoneToSave,
            'timezone'       => $timezone,
        ]]);

        // [เพิ่มใหม่] ประทับตราว่าผ่าน OTP และ Step 2 อย่างถูกต้องแล้ว
        session(['step2_passed' => true]);

        Log::channel('register')->info('✅ [Register] storeStep2 สำเร็จ → ไป Step 3', ['line_id' => $lineId]);
        return redirect()->route('register.step3');
    }

    // STEP 3 — จังหวัด + รหัสแนะนำ + ยอมรับเงื่อนไข (Final)
    public function showStep3()
    {
        if (!session()->has('social_register_data') || !session('step2_passed')) {
            return redirect()->route('register.step2');
        }

        $data = session('social_register_data');
        return view('auth.register.step3-address', compact('data'));
    }

    public function storeStep3(Request $request)
    {
        if (!session()->has('social_register_data') || !session('step2_passed')) {
            return redirect()->route('register.step2');
        }

        // ✅ validate เหลือแค่ 2 ฟิลด์ ทั้งคู่ไม่บังคับ
        $request->validate([
            'cust_province' => 'nullable|string|max:100',
            'referral_code' => 'nullable|string|max:20',
            'accept_terms'  => 'required',
        ], [
            'accept_terms.required' => 'กรุณายอมรับข้อกำหนดและเงื่อนไขการใช้บริการ',
        ]);

        session(['register_step3' => [
            'cust_province' => $request->cust_province,
            'referral_code' => $request->referral_code,
            'accept_news'   => $request->has('accept_news') ? 'Y' : 'N',
            'accept_terms'  => 'Y',
        ]]);

        session(['step3_passed' => true]);

        // ─── FINAL SUBMISSION LOGIC ───
        $socialData       = session('social_register_data');
        $step1            = session('register_step1'); // User Type
        $step2            = session('register_step2'); // Profile
        $step3            = session('register_step3'); // Address & Consents
        $lineId           = $socialData['line_id'];

        Log::channel('register')->info('📝 [Register] storeStep3 เริ่ม Final Submission', [
            'line_id'       => $lineId,
            'province'      => $step3['cust_province'] ?? null,
            'referral_code' => $step3['referral_code'] ?? null,
        ]);

        try {
            DB::beginTransaction();

            $rawEmail = !empty($step2['cust_email']) ? $step2['cust_email'] : null;
            if ($rawEmail === 'default@email.com' || trim((string)$rawEmail) === '') {
                $rawEmail = null;
            }

            // 1. User
            $user = User::updateOrCreate(
                ['line_id' => $lineId],
                [
                    'name'     => $step2['cust_firstname'] . ' ' . $step2['cust_lastname'],
                    'email'    => $rawEmail,
                    'password' => Hash::make($lineId),
                    'phone'    => $step2['cust_tel'],
                ]
            );

            // 2. TblCustomerProd
            $cust = TblCustomerProd::firstOrNew(['cust_uid' => $lineId]);
            $cust->cust_firstname = $step2['cust_firstname'];
            $cust->cust_lastname  = $step2['cust_lastname'];
            $cust->cust_gender    = $step2['cust_gender'];
            $cust->cust_email     = $rawEmail;
            $cust->cust_birthdate = $step2['cust_birthdate'];
            $cust->cust_tel       = $step2['cust_tel'];
            $cust->cust_province     = $step3['cust_province'] ?? '';
            $cust->cust_address      = '';
            $cust->cust_subdistrict  = '';
            $cust->cust_district     = '';
            $cust->cust_zipcode      = '';
            $cust->cust_full_address = $step3['cust_province'] ?? '';
            $cust->crm_user_type_id = $step1['crm_user_type_id'];
            $cust->cust_type        = 'line';
            $cust->cust_line        = $lineId;
            $cust->cust_prefix      = 'mr';
            $cust->status           = 'enabled';

            // Mapping checkboxes to DB
            $cust->accept_news       = $step3['accept_news']; // News
            $cust->accept_policy     = $step3['accept_terms']; // Policy
            $cust->accept_pdpa       = $step3['accept_terms']; // PDPA
            $cust->accept_marketing    = $step3['accept_news'];

            if (!$cust->datetime) {
                $cust->datetime = now();
            }

            if (!$cust->exists) {
                $cust->unlockkey           = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $cust->referral_code       = strtoupper(substr(md5($lineId . time()), 0, 8));
                $cust->cre_key             = now();
                $cust->accept_analyze_prod = 'N';
            }

            $cust->save();

            Log::channel('register')->info('✅ [Register] บันทึก TblCustomerProd สำเร็จ', [
                'line_id' => $lineId,
                'cust_id' => $cust->id,
                'is_new'  => $cust->wasRecentlyCreated,
            ]);

            // 3. Referral
            $refCode = $step3['referral_code'] ?? session('referrer_code');
            Log::channel('register')->info('🔗 [Register] ตรวจสอบ Referral Code', [
                'line_id'      => $lineId,
                'ref_code'     => $refCode,
                'referred_by'  => $cust->referred_by,
            ]);
            if ($refCode && empty($cust->referred_by)) {
                $referrer = TblCustomerProd::where('referral_code', $refCode)->first();
                Log::channel('register')->info('👥 [Register] ค้นหา Referrer', [
                    'ref_code'     => $refCode,
                    'found'        => !is_null($referrer),
                    'referrer_uid' => $referrer?->cust_uid,
                    'same_user'    => $referrer ? ($referrer->cust_uid === $lineId) : null,
                ]);
                if ($referrer && $referrer->cust_uid !== $lineId) {
                    $cust->update(['referred_by' => $referrer->cust_uid]);
                    $this->processReferralReward($referrer, $lineId, $user->name);
                }
            } else {
                Log::channel('register')->info('⚪ [Register] ข้ามการให้คะแนน Referral', [
                    'reason' => !$refCode ? 'ไม่มี ref_code' : 'มี referred_by แล้ว',
                ]);
            }

            // 4. Points
            $hasPoint = PointTransaction::where('line_id', $lineId)->where('process_code', 'REGISTER')->exists();
            Log::channel('register')->info('🎯 [Register] ตรวจสอบแต้มสมัครสมาชิก', [
                'line_id'   => $lineId,
                'has_point' => $hasPoint,
            ]);
            if (!$hasPoint) {
                Log::channel('register')->info('🎁 [Register] กำลังให้แต้มสมัครสมาชิก', ['line_id' => $lineId]);
                $this->awardFirstRegistrationPoints($cust, $lineId);
            }

            // [เพิ่มใหม่] ซิงค์คะแนนให้ตรงกับรายการธุรกรรมทั้งหมดเป็นขั้นตอนสุดท้าย
            Log::channel('register')->info('🔄 [Register] กำลัง syncPoints', ['line_id' => $lineId]);
            $cust->syncPoints();
            Log::channel('register')->info('✅ [Register] syncPoints เสร็จสิ้น', ['line_id' => $lineId, 'point' => $cust->fresh()->point]);

            DB::commit();
            Log::channel('register')->info('🎉 [Register] Final Submission สำเร็จทั้งหมด', ['line_id' => $lineId, 'cust_id' => $cust->id]);

            // 5. Login Log
            $logType = $cust->wasRecentlyCreated ? 'new_register' : 'update_profile';
            LoginLog::create([
                'user_id'    => $user->id,
                'line_id'    => $lineId,
                'status'     => 'success',
                'login_at'   => now(),
                'metadata'   => ['type' => $logType],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            Auth::login($user);
            $this->assignLineRichMenu($lineId);

            // 6. Clear Session
            session()->forget([
                'social_register_data',
                'register_step1',
                'register_step2',
                'register_step3',
                'step1_passed',
                'step2_passed',
                'step3_passed',
                'referrer_code',
                'after_login_redirect',
                'register_otp',
                'register_otp_phone',
                'register_otp_expire',
                'register_otp_db_format',
            ]);

            session([
                'line_avatar' => $socialData['avatar'],
                'line_email'  => $step2['cust_email'],
            ]);

            return redirect()->to(session('after_login_redirect') ?? '/dashboard');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('register')->error('❌ [Register] Final Submission Error', [
                'line_id' => $lineId ?? null,
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);
            return redirect()->route('register.step3')->with('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    }

    // OTP — ใช้ร่วมกับ Step 2
    // public function sendOtp(Request $request)
    // {
    //     if (!session()->has('social_register_data')) {
    //         return response()->json(['success' => false, 'message' => 'Session expired'], 401);
    //     }

    //     $socialData = session('social_register_data');
    //     $lineId     = $socialData['line_id'];

    //     $request->validate(['phone' => 'required']);

    //     $rawPhone = $request->phone;
    //     $dbPhone  = $this->normalizePhone($rawPhone);

    //     // ตรวจซ้ำเบอร์
    //     $exists = TblCustomerProd::where('cust_tel', $dbPhone)
    //         ->where('cust_uid', '!=', $lineId)->exists();
    //     if ($exists) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'เบอร์โทรศัพท์นี้ถูกใช้งานโดยสมาชิกท่านอื่นแล้ว'
    //         ], 422);
    //     }

    //     // Credit check (non-blocking)
    //     try {
    //         Http::timeout(2)->get('http://192.168.9.32:9000/api/check-credit-lk.php', [
    //             'system_name' => 'ระบบลงทะเบียนรับประกันสินค้าออนไลน์พัมคิน'
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::channel('register')->error('SMS Credit Check Failed: ' . $e->getMessage());
    //     }

    //     $otp      = (string) rand(1000, 9999);
    //     $smsPhone = str_replace('+', '', $rawPhone);

    //     session([
    //         'register_otp'           => $otp,
    //         'register_otp_phone'     => $rawPhone,
    //         'register_otp_db_format' => $dbPhone,
    //         'register_otp_expire'    => now('Asia/Bangkok')->addMinutes(5),
    //     ]);

    //     try {
    //         $response = Http::asForm()->post(env('SEND_OTP_URI'), [
    //             'ACCOUNT'  => env('SEND_OTP_ACCOUNT'),
    //             'PASSWORD' => env('SEND_OTP_PASSWORD'),
    //             'MOBILE'   => $smsPhone,
    //             'MESSAGE'  => "รหัส OTP ของคุณคือ {$otp} (ใช้ได้ภายใน 5 นาที)",
    //             'OPTION'   => 'SEND_TYPE=General',
    //         ]);

    //         Log::channel('register')->info("OTP Sent to {$smsPhone}", ['otp_debug' => $otp]);

    //         if ($response->successful()) {
    //             return response()->json(['success' => true, 'message' => 'ส่งรหัส OTP เรียบร้อยแล้ว']);
    //         }
    //         throw new \Exception('SMS Gateway Error: ' . $response->status());
    //     } catch (\Exception $e) {
    //         Log::channel('register')->error('Send OTP Failed: ' . $e->getMessage());
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'ไม่สามารถส่ง OTP ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง'
    //         ], 500);
    //     }
    // }


    public function sendOtp(Request $request)
    {
        if (!session()->has('social_register_data')) {
            return response()->json(['success' => false, 'message' => 'Session expired'], 401);
        }

        $socialData = session('social_register_data');
        $lineId     = $socialData['line_id'];

        $request->validate(['phone' => 'required']);

        $rawPhone = $request->phone;
        $dbPhone  = $this->normalizePhone($rawPhone);

        // ตรวจซ้ำเบอร์
        $exists = TblCustomerProd::where('cust_tel', $dbPhone)
            ->where('cust_uid', '!=', $lineId)->exists();
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'เบอร์โทรศัพท์นี้ถูกใช้งานโดยสมาชิกท่านอื่นแล้ว'
            ], 422);
        }

        // ย้าย credit check มาทำแบบ fire-and-forget (ไม่บล็อก)
        // หรือลด timeout เหลือ 1 วิ
        // try {
        //     Http::timeout(1)->get('http://192.168.9.32:9000/api/check-credit-lk.php', [
        //         'system_name' => 'ระบบลงทะเบียนรับประกันสินค้าออนไลน์พัมคิน'
        //     ]);
        // } catch (\Exception $e) {
        //     Log::channel('register')->error('SMS Credit Check Failed: ' . $e->getMessage());
        // }

        $otp      = str_pad((string) random_int(1000, 9999), 4, '0', STR_PAD_LEFT); // แก้ rand → random_int
        $smsPhone = str_replace('+', '', $rawPhone);

        session([
            'register_otp'           => $otp,
            'register_otp_phone'     => $rawPhone,
            'register_otp_db_format' => $dbPhone,
            'register_otp_expire'    => now('Asia/Bangkok')->addMinutes(5),
        ]);

        try {
            $response = Http::timeout(8)
                ->connectTimeout(5)
                ->asForm()
                ->post(env('SEND_OTP_URI'), [
                    'ACCOUNT'  => env('SEND_OTP_ACCOUNT'),
                    'PASSWORD' => env('SEND_OTP_PASSWORD'),
                    'MOBILE'   => $smsPhone,
                    'MESSAGE'  => "รหัส OTP ของคุณคือ {$otp} (ใช้ได้ภายใน 5 นาที)",
                    'OPTION'   => 'SEND_TYPE=General',
                ]);

            Log::channel('register')->info("OTP Sent to {$smsPhone}", [
                'otp_debug' => $otp,
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                return response()->json(['success' => true, 'message' => 'ส่งรหัส OTP เรียบร้อยแล้ว']);
            }
            throw new \Exception('SMS Gateway Error: ' . $response->status() . ' - ' . $response->body());
        } catch (\Exception $e) {
            Log::channel('register')->error('Send OTP Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ไม่สามารถส่ง OTP ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง: ' . $e->getMessage()
            ], 500);
        }
    }

    public function showRegistrationForm()
    {
        return redirect()->route('register.step1');
    }

    private function normalizePhone($phone): string
    {
        // ลบช่องว่างและอักขระพิเศษออกก่อน
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        // ถ้าขึ้นต้นด้วย +66 แปลงเป็น 0
        if (str_starts_with($phone, '+66')) {
            return '0' . substr($phone, 3);
        }

        // ถ้าไม่มี + แต่ขึ้นต้นด้วย 66 ให้แปลงเป็น 0
        if (str_starts_with($phone, '66')) {
            return '0' . substr($phone, 2);
        }

        return $phone;
    }

    private function isOtpVerificationEnabled(): bool
    {
        return !env('SKIP_OTP', false);
    }

    private function awardFirstRegistrationPoints($cust, $lineId): void
    {
        Log::channel('register')->info('🎁 [Register] awardFirstRegistrationPoints เริ่มต้น', [
            'line_id'     => $lineId,
            'point_before'=> (int) $cust->point,
        ]);

        $process = TypeProcessPoint::where('process_code', 'REGISTER')->where('is_active', 1)->first();
        $initialPoint = $process?->default_point ?? 50;
        Log::channel('register')->info('🔍 [Register] ดึง TypeProcessPoint REGISTER', [
            'found'         => !is_null($process),
            'initial_point' => $initialPoint,
        ]);
        $pointBefore = (int) $cust->point;
        $pointAfter  = $pointBefore + $initialPoint;

        $newTier = match (true) {
            $pointAfter >= 3000 => 'platinum',
            $pointAfter >= 1000 => 'gold',
            default             => 'silver',
        };

        $cust->update([
            'point'           => $pointAfter,
            'tier_key'        => $newTier,
            'tier_updated_at' => now(),
            'tier_expired_at' => now()->addYears(2),
            'last_earn_at'    => now(),
        ]);

        PointTransaction::create([
            'line_id'          => $lineId,
            'transaction_type' => 'earn',
            'process_code'     => 'REGISTER',
            'pname'            => 'สมัครสมาชิกครั้งแรก',
            'point_before'     => $pointBefore,
            'point_tran'       => $initialPoint,
            'point_after'      => $pointAfter,
            'tier'             => $newTier,
            'docdate'          => now()->toDateString(),
            'trandate'         => now()->toDateString(),
            'docno'            => 'REG-' . now()->format('YmdHis'),
            'created_at'       => now(),
            'expired_at'       => now()->addYears(2)->toDateString(),
        ]);
    }

    private function processReferralReward($referrer, $refereeUid, $refereeName): void
    {
        Log::channel('register')->info('🎁 [Referral] processReferralReward เริ่มต้น', [
            'referrer_uid'  => $referrer->cust_uid,
            'referrer_name' => $referrer->cust_firstname,
            'referee_uid'   => $refereeUid,
            'referee_name'  => $refereeName,
            'referrer_tier' => $referrer->tier_key,
            'referrer_point'=> $referrer->point,
        ]);

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
        Log::channel('register')->info('📋 [Referral] สร้าง ReferralHistory สำเร็จ', ['history_id' => $refHistory->id]);

        // 2. Give Points to Referrer
        $master = TypeProcessPoint::where('process_code', 'FRIEND_REFERRAL')->where('is_active', 1)->first();
        Log::channel('register')->info('🔍 [Referral] ค้นหา TypeProcessPoint FRIEND_REFERRAL', ['found' => !is_null($master)]);
        if ($master) {
            $pointEarn = match ($referrer->tier_key) {
                'platinum' => $master->point_platinum,
                'gold'     => $master->point_gold,
                'silver'   => $master->point_silver,
                default    => $master->default_point,
            };

            $pointBefore = $referrer->point;
            Log::channel('register')->info('💰 [Referral] คำนวณคะแนนให้ Referrer', [
                'referrer_uid' => $referrer->cust_uid,
                'tier_key'     => $referrer->tier_key,
                'point_earn'   => $pointEarn,
                'point_before' => $pointBefore,
            ]);
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
                'expired_at'       => Carbon::now()->addYears(2),
            ]);

            $refHistory->update(['status_referrer' => 'rewarded', 'points_referrer' => $pointEarn]);
            Log::channel('register')->info('✅ [Referral] processReferralReward สำเร็จ', [
                'referrer_uid' => $referrer->cust_uid,
                'point_earn'   => $pointEarn,
            ]);
        } else {
            Log::channel('register')->warning('⚠️ [Referral] ไม่พบ TypeProcessPoint FRIEND_REFERRAL หรือ is_active=0');
        }
    }

    private function removeEmoji($text): string
    {
        return preg_replace(
            '/[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]/u',
            '',
            $text
        );
    }

    protected function assignLineRichMenu(string $lineId)
    {
        $richMenuId = env('RICH_MENU_NEW_REGISTER');

        // อย่าลืมเอา Channel Access Token ของ LINE Messaging API ไปใส่ในไฟล์ .env ด้วยนะครับ
        $accessToken = env('LINE_CHANNEL_ACCESS_TOKEN');

        if (empty($accessToken)) return;

        try {
            $response = Http::withToken($accessToken)
                ->post("https://api.line.me/v2/bot/user/{$lineId}/richmenu/{$richMenuId}");

            if (!$response->successful()) {
                Log::channel('register')->error("Assign Rich Menu Failed for {$lineId}: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::channel('register')->error("Assign Rich Menu Error: " . $e->getMessage());
        }
    }
}
