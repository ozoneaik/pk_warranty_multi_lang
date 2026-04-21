<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use App\Models\MasterWaaranty\MembershipTierHistory;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TypeProcessPoint;
use App\Models\MasterWaaranty\ReferralHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class LineAuthController extends Controller
{


    public function redirectToLine()
    {
        $redirectUrl = request()->query('redirect');
        $ref = request()->query('ref');

        if ($redirectUrl) {
            session(['after_login_redirect' => $redirectUrl]);
        }

        if ($ref) {
            session(['referrer_code' => $ref]);
        }

        return Socialite::driver('line')->redirect();
    }

    // public function handleLineCallback(Request $request)
    // {
    //     try {
    //         $lineUser = Socialite::driver('line')->user();
    //         $lineId   = $lineUser->getId();
    //         $email    = $lineUser->getEmail();
    //         $avatar   = $lineUser->getAvatar();
    //         $name     = $lineUser->getName();

    //         $cust = TblCustomerProd::where('cust_uid', $lineId)->first();

    //         if ($cust) {
    //             $lastLogin = LoginLog::where('line_id', $lineId)
    //                 ->where('status', 'success')
    //                 ->latest('login_at')
    //                 ->first();

    //             // เช็คว่าไม่ได้เข้านานเกินกำหนด (ตัวอย่างใช้ 30 วัน)
    //             if ($lastLogin && $lastLogin->login_at->diffInDays(now()) > 30) {

    //                 Log::channel('line_auth')->warning("⏳ User {$lineId} inactive > 30 days. Redirecting to Update Profile.");

    //                 // ดึงข้อมูลจาก $cust ใส่ Session ให้ครบ
    //                 session([
    //                     'social_register_data' => [
    //                         // ข้อมูลพื้นฐานจาก LINE
    //                         'provider' => 'line',
    //                         'line_id'  => $lineId,
    //                         'email'    => $cust->cust_email ?? $email, // ใช้จาก DB ก่อน ถ้าไม่มีค่อยใช้จาก LINE
    //                         'avatar'   => $avatar,
    //                         'name'     => $name,
    //                         'is_update_mode' => true, // ตัวบอก View ว่านี่คือการ Update (เปลี่ยนหัวข้อ)

    //                         // ข้อมูลเดิมจาก Database (สำคัญมาก! ถ้าไม่ใส่ตรงนี้ ฟอร์มจะโล่ง)
    //                         'cust_firstname'   => $cust->cust_firstname,
    //                         'cust_lastname'    => $cust->cust_lastname,
    //                         'cust_tel'         => $cust->cust_tel,
    //                         'cust_gender'      => $cust->cust_gender,
    //                         'cust_birthdate'   => $cust->cust_birthdate,

    //                         // ข้อมูลที่อยู่
    //                         'cust_address'     => $cust->cust_address,
    //                         'cust_province'    => $cust->cust_province,
    //                         'cust_district'    => $cust->cust_district,
    //                         'cust_subdistrict' => $cust->cust_subdistrict,
    //                         'cust_zipcode'     => $cust->cust_zipcode,
    //                     ]
    //                 ]);

    //                 return redirect()->route('register.complete_profile')
    //                     ->with('error', 'คุณไม่ได้เข้าใช้งานนานเกิน 30 วัน กรุณาตรวจสอบข้อมูลและยืนยันตัวตน');
    //             }

    //             return $this->loginExistingUser($lineUser, $cust);
    //         }

    //         session([
    //             'social_register_data' => [
    //                 'provider' => 'line',
    //                 'line_id'  => $lineId,
    //                 'name'     => $name,
    //                 'email'    => $email,
    //                 'avatar'   => $avatar,
    //             ]
    //         ]);

    //         return redirect()->route('register.complete_profile');
    //     } catch (\Exception $e) {
    //         Log::channel('line_auth')->error('LINE Login Error', ['msg' => $e->getMessage()]);
    //         return redirect()->route('login')->with('error', 'Login Failed');
    //     }
    // }

    public function handleLineCallback(Request $request)
    {
        try {
            $lineUser = Socialite::driver('line')->user();
            $lineId   = $lineUser->getId();
            $email    = $lineUser->getEmail();
            $avatar   = $lineUser->getAvatar();
            $name     = $lineUser->getName();

            Log::channel('line_auth')->info('🔵 [LineAuth] handleLineCallback เริ่มต้น', [
                'line_id' => $lineId,
                'name'    => $name,
                'email'   => $email,
            ]);

            $cust = TblCustomerProd::where('cust_uid', $lineId)->first();

            if ($cust) {
                Log::channel('line_auth')->info('✅ [LineAuth] พบข้อมูลลูกค้าในระบบ', [
                    'line_id'   => $lineId,
                    'cust_id'   => $cust->id,
                    'status'    => $cust->status,
                    'tier_key'  => $cust->tier_key,
                    'point'     => $cust->point,
                ]);

                $lastLogin = LoginLog::where('line_id', $lineId)
                    ->where('status', 'success')
                    ->latest('login_at')
                    ->first();

                Log::channel('line_auth')->info('🕐 [LineAuth] ตรวจสอบ Last Login', [
                    'line_id'      => $lineId,
                    'last_login'   => $lastLogin?->login_at,
                    'days_since'   => $lastLogin ? $lastLogin->login_at->diffInDays(now()) : null,
                ]);

                // เช็คว่าไม่ได้เข้านานเกินกำหนด (ตัวอย่างใช้ 30 วัน)
                if ($lastLogin && $lastLogin->login_at->diffInDays(now()) > 30) {

                    Log::channel('line_auth')->warning("⏳ User {$lineId} inactive > 30 days. Redirecting to Update Profile Step 1.");

                    // 1. ข้อมูลพื้นฐานสำหรับอ้างอิง
                    session([
                        'social_register_data' => [
                            // ข้อมูลพื้นฐานจาก LINE
                            'provider' => 'line',
                            'line_id'  => $lineId,
                            'email'    => $cust->cust_email ?? $email, // ใช้จาก DB ก่อน ถ้าไม่มีค่อยใช้จาก LINE
                            'avatar'   => $avatar,
                            'name'     => $name,
                            'is_update_mode' => true, // ตัวบอก View ว่านี่คือการ Update (เปลี่ยนหัวข้อ)
                        ]
                    ]);

                    // 2. Pre-fill ข้อมูลสำหรับ Step 1 (ประเภทผู้ใช้งาน)
                    session(['register_step1' => [
                        'crm_user_type_id' => $cust->crm_user_type_id,
                    ]]);

                    // 3. Pre-fill ข้อมูลสำหรับ Step 2 (ข้อมูลส่วนตัว)
                    session(['register_step2' => [
                        'cust_firstname' => $cust->cust_firstname,
                        'cust_lastname'    => $cust->cust_lastname,
                        'cust_gender'      => $cust->cust_gender,
                        'cust_email'     => $cust->cust_email ?? $email,
                        'cust_birthdate'   => $cust->cust_birthdate,
                        'cust_tel'       => $cust->cust_tel,
                        'timezone'       => 'Asia/Bangkok', // Default ให้
                    ]]);

                    // 4. Pre-fill ข้อมูลสำหรับ Step 3 (ที่อยู่)
                    session(['register_step3' => [
                        'cust_address'     => $cust->cust_address,
                        'cust_province'    => $cust->cust_province,
                        'cust_district'    => $cust->cust_district,
                        'cust_subdistrict' => $cust->cust_subdistrict,
                        'cust_zipcode'     => $cust->cust_zipcode,
                    ]]);

                    // Redirect ไปที่ Step 1 ของระบบใหม่
                    return redirect()->route('register.step1')
                        ->with('error', 'คุณไม่ได้เข้าใช้งานนานเกิน 30 วัน กรุณาตรวจสอบข้อมูลและยืนยันตัวตน');
                }

                return $this->loginExistingUser($lineUser, $cust);
            }

            // กรณีเป็น User ใหม่ที่เพิ่งเคย Login ครั้งแรก
            Log::channel('line_auth')->info('🆕 [LineAuth] ไม่พบข้อมูลลูกค้า → Redirect ไป Register Step 1', [
                'line_id' => $lineId,
                'name'    => $name,
            ]);

            session([
                'social_register_data' => [
                    'provider' => 'line',
                    'line_id'  => $lineId,
                    'name'     => $name,
                    'email'    => $email,
                    'avatar'   => $avatar,
                ]
            ]);

            // Redirect ไปที่ Step 1 สำหรับคนสมัครใหม่
            return redirect()->route('register.step1');
        } catch (\Exception $e) {
            Log::channel('line_auth')->error('❌ [LineAuth] LINE Login Error', [
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('login')->with('error', 'Login Failed');
        }
    }

    // ฟังก์ชั่นสำหรับ Login คนเก่า (Extract มาจาก Logic เดิมของคุณ)
    // private function loginExistingUser($lineUser, $cust)
    // {
    //     $lineId = $lineUser->getId();

    //     // Update User Model (Laravel Auth)
    //     $user = User::firstOrNew(['line_id' => $lineId]);
    //     if (!$user->exists) {
    //         $user->name = trim($cust->cust_firstname . ' ' . $cust->cust_lastname);
    //         $user->email = $cust->cust_email ?? $lineUser->getEmail();
    //         $user->password = bcrypt($lineId);
    //         $user->save();
    //     }

    //     // Update Customer Data บางส่วน
    //     $cust->cust_line  = $lineId;
    //     $cust->cust_email = $cust->cust_email ?: $lineUser->getEmail();
    //     $cust->save();

    //     // Check Tier Expiry (Logic เดิม)
    //     $this->checkTierExpiry($cust, $user);

    //     // Login Log
    //     LoginLog::create([
    //         'user_id' => $user->id,
    //         'line_id' => $lineId,
    //         'status'  => 'success',
    //         'login_at' => now(),
    //         'ip_address' => request()->ip(),
    //         'user_agent' => request()->userAgent(),
    //     ]);

    //     Auth::login($user);

    //     // Redirect
    //     $redirect = session('after_login_redirect') ?? '/dashboard';
    //     session()->forget(['referrer_code', 'after_login_redirect']);
    //     session(['line_avatar' => $lineUser->getAvatar(), 'line_email' => $user->email]);

    //     return redirect()->to($redirect);
    // }

    // private function loginExistingUser($lineUser, $cust)
    // {
    //     $lineId = $lineUser->getId();

    //     // Update User Model (Laravel Auth)
    //     $user = User::firstOrNew(['line_id' => $lineId]);
    //     if (!$user->exists) {
    //         $user->name = trim($cust->cust_firstname . ' ' . $cust->cust_lastname);
    //         $user->email = $cust->cust_email ?? $lineUser->getEmail();
    //         $user->password = bcrypt($lineId);
    //         $user->save();
    //     }

    //     // Update Customer Data บางส่วน
    //     $cust->cust_line  = $lineId;
    //     $cust->cust_email = $cust->cust_email ?: $lineUser->getEmail();
    //     $cust->save();

    //     // 1. เพิ่ม Fallback Logic: เช็คว่าเคยได้แต้มสมัครสมาชิกหรือยัง ถ้ายังให้บวกแต้ม
    //     $hasRegisteredPoint = PointTransaction::where('line_id', $lineId)
    //         ->where('process_code', 'REGISTER')
    //         ->exists();

    //     if (!$hasRegisteredPoint) {
    //         $this->awardFirstRegistrationPoints($cust, $lineId);
    //     }

    //     // Check Tier Expiry (Logic เดิม)
    //     $this->checkTierExpiry($cust, $user);

    //     // Login Log
    //     LoginLog::create([
    //         'user_id' => $user->id,
    //         'line_id' => $lineId,
    //         'status'  => 'success',
    //         'login_at' => now(),
    //         'ip_address' => request()->ip(),
    //         'user_agent' => request()->userAgent(),
    //     ]);

    //     Auth::login($user);

    //     // Redirect
    //     $redirect = session('after_login_redirect') ?? '/dashboard';
    //     session()->forget(['referrer_code', 'after_login_redirect']);
    //     session(['line_avatar' => $lineUser->getAvatar(), 'line_email' => $user->email]);

    //     return redirect()->to($redirect);
    // }

    private function loginExistingUser($lineUser, $cust)
    {
        $lineId = $lineUser->getId();

        Log::channel('line_auth')->info('🔑 [LineAuth] loginExistingUser เริ่มต้น', [
            'line_id'  => $lineId,
            'cust_id'  => $cust->id,
            'tier_key' => $cust->tier_key,
            'point'    => $cust->point,
            'status'   => $cust->status,
        ]);

        // 1. Fallback เป็น null ถ้าไม่มีอีเมล หรือเป็น default@email.com
        $rawEmail = $cust->cust_email ?? $lineUser->getEmail();
        if (empty($rawEmail) || $rawEmail === 'default@email.com' || trim($rawEmail) === '') {
            $rawEmail = null;
        }

        // 2. Update User Model (Laravel Auth)
        $user = User::firstOrNew(['line_id' => $lineId]);
        if (!$user->exists) {
            $user->name = trim($cust->cust_firstname . ' ' . $cust->cust_lastname);
            $user->email = $rawEmail;
            $user->password = bcrypt($lineId);
            $user->status = 'active';
            $user->save();
        } else {
            // [เสริม] ล้างบางข้อมูลเก่า ถ้าคนเก่าติด default@email.com อยู่ให้เคลียร์เป็น null
            if ($user->email === 'default@email.com' || $user->email === '') {
                $user->email = null;
                $user->save();
            }
        }

        // 3. Update Customer Data บางส่วน
        $cust->cust_line  = $lineId;
        $cust->cust_email = $rawEmail;
        $cust->status = 'enabled';
        $cust->save();

        // [เพิ่มใหม่] ซิงค์คะแนนจากประวัติธุรกรรมเสมอเมื่อ Login เพื่อความแม่นยำ
        Log::channel('line_auth')->info('🔄 [LineAuth] กำลัง syncPoints', ['line_id' => $lineId]);
        $cust->syncPoints();
        Log::channel('line_auth')->info('✅ [LineAuth] syncPoints เสร็จสิ้น', ['line_id' => $lineId, 'point_after_sync' => $cust->fresh()->point]);

        // 4. เพิ่ม Fallback Logic: เช็คว่าเคยได้แต้มสมัครสมาชิกหรือยัง ถ้ายังให้บวกแต้ม
        $hasRegisteredPoint = PointTransaction::where('line_id', $lineId)
            ->where('process_code', 'REGISTER')
            ->exists();

        Log::channel('line_auth')->info('🎯 [LineAuth] ตรวจสอบแต้มการสมัคร', [
            'line_id'             => $lineId,
            'has_registered_point' => $hasRegisteredPoint,
        ]);

        if (!$hasRegisteredPoint) {
            Log::channel('line_auth')->info('🎁 [LineAuth] ให้แต้มสมัครสมาชิก (Fallback)', ['line_id' => $lineId]);
            $this->awardFirstRegistrationPoints($cust, $lineId);
        }

        // Check Tier Expiry
        $this->checkTierExpiry($cust, $user);

        // Login Log
        LoginLog::create([
            'user_id' => $user->id,
            'line_id' => $lineId,
            'status'  => 'success',
            'login_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        Auth::login($user);
        Log::channel('line_auth')->info('✅ [LineAuth] Login สำเร็จ', ['line_id' => $lineId, 'user_id' => $user->id]);

        // Redirect
        $redirect = session('after_login_redirect') ?? '/dashboard';
        session()->forget(['referrer_code', 'after_login_redirect']);
        session(['line_avatar' => $lineUser->getAvatar(), 'line_email' => $user->email]);

        Log::channel('line_auth')->info('🏁 [LineAuth] Redirect หลัง Login', ['to' => $redirect]);
        return redirect()->to($redirect);
    }

    private function awardFirstRegistrationPoints($cust, $lineId)
    {
        try {
            DB::beginTransaction();

            $process = TypeProcessPoint::where('process_code', 'REGISTER')->where('is_active', 1)->first();
            $initialPoint = $process?->default_point ?? 50;

            // ดึงคะแนนเดิมมาบวกเพิ่ม ไม่เขียนทับ
            $pointBefore = (int) $cust->point;
            $pointAfter  = $pointBefore + $initialPoint;

            // คำนวณ Tier ใหม่จากคะแนนสะสมรวม
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
                'pname'            => 'รับคะแนนสมัครสมาชิก',
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

            DB::commit();
            Log::channel('line_auth')->info("🎁 [Fallback Point] ให้คะแนนการสมัครสมาชิกกับคนเก่า: {$lineId} | ได้รับ {$initialPoint} แต้ม | รวมเป็น {$pointAfter} แต้ม");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('line_auth')->error("❌ [Fallback Point Error] แจกแต้มคนเก่าไม่สำเร็จ: " . $e->getMessage());
        }
    }

    private function checkTierExpiry($cust, $user)
    {
        if (empty($cust->tier_expired_at)) return;

        $expiredAt = Carbon::parse($cust->tier_expired_at);
        $now = Carbon::now();

        if ($now->greaterThan($expiredAt)) {
            $oldTier = $cust->tier_key;
            $oldExpired = $cust->tier_expired_at;
            $point = (int) $cust->point;

            $newTier = match (true) {
                $point >= 3000 => 'platinum',
                $point >= 1000 => 'gold',
                default        => 'silver',
            };

            $cust->update([
                'tier_key'        => $newTier,
                'tier_updated_at' => $now,
                'tier_expired_at' => $now->copy()->addYears(2),
            ]);

            try {
                MembershipTierHistory::create([
                    'user_id'       => $user->id,
                    'cust_line'     => $cust->cust_line,
                    'cust_tel'      => $cust->cust_tel,
                    'tier_old'      => $oldTier,
                    'tier_new'      => $newTier,
                    'expired_at'    => $oldExpired,
                    'changed_at'    => $now,
                    'reason'        => 'expired',
                    'point_at_time' => $point,
                ]);
            } catch (\Throwable $e) {
                Log::channel('line_auth')->error('❌ Tier History Error', ['msg' => $e->getMessage()]);
            }
        }
    }
}
