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
        $data = session('social_register_data');
        return view('auth.register.step1-user-type', compact('data'));
    }

    public function storeStep1(Request $request)
    {
        if (!session()->has('social_register_data')) {
            return redirect()->route('login');
        }

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

        return redirect()->route('register.step2');
    }


    // STEP 2 — กรอกข้อมูลส่วนตัว + OTP
    public function showStep2()
    {
        if (!session()->has('social_register_data')) {
            return redirect()->route('login');
        }

        // [แก้ใหม่] เช็คจากตราประทับ step1_passed แทน
        if (!session('step1_passed')) {
            return redirect()->route('register.step1')->with('error', 'กรุณาเลือกประเภทผู้ใช้งานก่อนทำรายการ');
        }

        $data = session('social_register_data');
        if ($prev = session('register_step2')) {
            $data = array_merge($data, $prev);
        }

        return view('auth.register.step2-profile', compact('data'));
    }

    public function storeStep2(Request $request)
    {
        if (!session()->has('social_register_data')) {
            return redirect()->route('login');
        }

        $socialData = session('social_register_data');
        $lineId     = $socialData['line_id'];
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
        $request->validate($rules);

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

        return redirect()->route('register.step3');
    }

    // STEP 3 — ที่อยู่ + รหัสแนะนำเพื่อน + บันทึกจริง
    public function showStep3()
    {
        if (!session()->has('social_register_data')) {
            return redirect()->route('login');
        }

        // [แก้ใหม่] เช็คตราประทับ step2_passed (ถ้าไม่ผ่าน OTP จะไม่มีค่านี้)
        if (!session('step2_passed')) {
            return redirect()->route('register.step2')->with('error', 'กรุณายืนยันข้อมูลส่วนตัวและ OTP ก่อนดำเนินการต่อ');
        }

        $data = session('social_register_data');
        return view('auth.register.step3-address', compact('data'));
    }

    public function storeStep3(Request $request)
    {
        // [แก้ใหม่] เช็ค Guard เพื่อความปลอดภัยสูงสุด ตอน Post
        if (!session()->has('social_register_data') || !session('step2_passed')) {
            return redirect()->route('register.step1')->with('error', 'เกิดข้อผิดพลาดของเซสชัน กรุณาทำรายการใหม่');
        }

        $request->validate([
            'cust_address'     => 'nullable|string|max:255',
            'cust_province'    => 'required|string',
            'cust_district'    => 'required|string',
            'cust_subdistrict' => 'required|string',
            'cust_zipcode'     => 'nullable|string|max:10',
            'referral_code'    => 'nullable|string|max:20',
        ]);

        // Merge ข้อมูลจากทุก Step
        $socialData = session('social_register_data');
        $step1      = session('register_step1');
        $step2      = session('register_step2');
        $lineId     = $socialData['line_id'];

        session(['register_step3' => [
            'cust_address'     => $request->cust_address,
            'cust_province'    => $request->cust_province,
            'cust_district'    => $request->cust_district,
            'cust_subdistrict' => $request->cust_subdistrict,
            'cust_zipcode'     => $request->cust_zipcode,
        ]]);

        try {
            DB::beginTransaction();

            // ── 1. User (Laravel Auth) ──────────────────────────────
            $user = User::updateOrCreate(
                ['line_id' => $lineId],
                [
                    'name'     => $step2['cust_firstname'] . ' ' . $step2['cust_lastname'],
                    'email'    => $step2['cust_email'],
                    'password' => Hash::make($lineId),
                    'phone'    => $step2['cust_tel'],
                ]
            );

            // ── 2. TblCustomerProd ────────────────────────────────
            $cust = TblCustomerProd::firstOrNew(['cust_uid' => $lineId]);

            $cust->cust_firstname = $step2['cust_firstname'];
            $cust->cust_lastname  = $step2['cust_lastname'];
            $cust->cust_gender    = $step2['cust_gender'];
            $cust->cust_email     = $step2['cust_email'];
            $cust->cust_birthdate = $step2['cust_birthdate'];
            $cust->cust_tel       = $step2['cust_tel'];

            $fullAddress = collect([
                $request->cust_address,
                'ตำบล/แขวง ' . $request->cust_subdistrict,
                'อำเภอ/เขต ' . $request->cust_district,
                'จังหวัด '   . $request->cust_province,
                $request->cust_zipcode,
            ])->filter()->implode(' ');

            $cust->cust_full_address = $fullAddress;
            $cust->cust_address      = $request->cust_address ?? '';
            $cust->cust_subdistrict  = $request->cust_subdistrict;
            $cust->cust_district     = $request->cust_district;
            $cust->cust_province     = $request->cust_province;
            $cust->cust_zipcode      = $request->cust_zipcode ?? '';

            $cust->crm_user_type_id = $step1['crm_user_type_id'];
            $cust->cust_type        = 'line';

            $cust->cust_line  = $lineId;
            $cust->cust_prefix = 'mr';
            $cust->status     = 'enabled';
            if (!$cust->datetime) {
                $cust->datetime = now();
            }

            if (!$cust->exists) {
                $cust->unlockkey     = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $cust->referral_code = strtoupper(substr(md5($lineId . time()), 0, 8));
                $cust->cre_key       = now();
                $cust->accept_news         = 'N';
                $cust->accept_policy       = 'N';
                $cust->accept_pdpa         = 'N';
                $cust->accept_analyze_prod = 'N';
                $cust->accept_marketing    = 'N';
            }

            $cust->save();

            // ── 3. Referral ────────────────────────────────────────
            $refCode = $request->referral_code ?: session('referrer_code');
            if ($refCode && empty($cust->referred_by)) {
                $referrer = TblCustomerProd::where('referral_code', $refCode)->first();
                if ($referrer && $referrer->cust_uid !== $lineId) {
                    $cust->update(['referred_by' => $referrer->cust_uid]);
                    $this->processReferralReward($referrer, $lineId, $user->name);
                }
            }

            // ── 4. คะแนนสมัครสมาชิกครั้งแรก ──────────────────────
            $hasPoint = PointTransaction::where('line_id', $lineId)
                ->where('process_code', 'REGISTER')->exists();
            if (!$hasPoint) {
                $this->awardFirstRegistrationPoints($cust, $lineId);
            }

            DB::commit();

            // ── 5. Login Log ────────────────────────────────────────
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

            // ── 6. Clear Session (เพิ่มตัวแปรที่ใช้เช็ค Flag เข้าไปให้เกลี้ยง) ──
            session()->forget([
                'social_register_data',
                'register_step1',
                'register_step2',
                'register_step3',
                'step1_passed', // เคลียร์ตราประทับ
                'step2_passed', // เคลียร์ตราประทับ
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
            Log::error('Register Step3 Error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'เกิดข้อผิดพลาด: ' . $e->getMessage());
        }
    }

    // OTP — ใช้ร่วมกับ Step 2
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

        // Credit check (non-blocking)
        try {
            Http::timeout(2)->get('http://192.168.9.32:9000/api/check-credit-lk.php', [
                'system_name' => 'ระบบลงทะเบียนรับประกันสินค้าออนไลน์พัมคิน'
            ]);
        } catch (\Exception $e) {
            Log::error('SMS Credit Check Failed: ' . $e->getMessage());
        }

        $otp      = (string) rand(1000, 9999);
        $smsPhone = str_replace('+', '', $rawPhone);

        session([
            'register_otp'           => $otp,
            'register_otp_phone'     => $rawPhone,
            'register_otp_db_format' => $dbPhone,
            'register_otp_expire'    => now('Asia/Bangkok')->addMinutes(5),
        ]);

        try {
            $response = Http::asForm()->post(env('SEND_OTP_URI'), [
                'ACCOUNT'  => env('SEND_OTP_ACCOUNT'),
                'PASSWORD' => env('SEND_OTP_PASSWORD'),
                'MOBILE'   => $smsPhone,
                'MESSAGE'  => "รหัส OTP ของคุณคือ {$otp} (ใช้ได้ภายใน 5 นาที)",
                'OPTION'   => 'SEND_TYPE=General',
            ]);

            Log::info("OTP Sent to {$smsPhone}", ['otp_debug' => $otp]);

            if ($response->successful()) {
                return response()->json(['success' => true, 'message' => 'ส่งรหัส OTP เรียบร้อยแล้ว']);
            }
            throw new \Exception('SMS Gateway Error: ' . $response->status());
        } catch (\Exception $e) {
            Log::error('Send OTP Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ไม่สามารถส่ง OTP ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง'
            ], 500);
        }
    }

    public function showRegistrationForm()
    {
        return redirect()->route('register.step1');
    }

    private function normalizePhone($phone): string
    {
        if (str_starts_with($phone, '+66')) {
            return '0' . substr($phone, 3);
        }
        return $phone;
    }

    private function isOtpVerificationEnabled(): bool
    {
        return !env('SKIP_OTP', false);
    }

    private function awardFirstRegistrationPoints($cust, $lineId): void
    {
        $process = TypeProcessPoint::where('process_code', 'REGISTER')->where('is_active', 1)->first();
        $initialPoint = $process?->default_point ?? 50;
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
                'expired_at'       => Carbon::now()->addYears(2),
            ]);

            $refHistory->update(['status_referrer' => 'rewarded', 'points_referrer' => $pointEarn]);
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
}
