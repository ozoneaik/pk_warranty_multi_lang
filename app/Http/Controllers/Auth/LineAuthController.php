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

    public function handleLineCallback(Request $request)
    {
        try {
            $lineUser = Socialite::driver('line')->user();
            $lineId   = $lineUser->getId();
            $email    = $lineUser->getEmail();
            $avatar   = $lineUser->getAvatar();
            $name     = $lineUser->getName();

            $cust = TblCustomerProd::where('cust_uid', $lineId)->first();

            if ($cust) {
                $lastLogin = LoginLog::where('line_id', $lineId)
                    ->where('status', 'success')
                    ->latest('login_at')
                    ->first();

                // เช็คว่าไม่ได้เข้านานเกินกำหนด (ตัวอย่างใช้ 30 วัน)
                if ($lastLogin && $lastLogin->login_at->diffInDays(now()) > 30) {

                    Log::warning("⏳ User {$lineId} inactive > 30 days. Redirecting to Update Profile.");

                    // ดึงข้อมูลจาก $cust ใส่ Session ให้ครบ
                    session([
                        'social_register_data' => [
                            // ข้อมูลพื้นฐานจาก LINE
                            'provider' => 'line',
                            'line_id'  => $lineId,
                            'email'    => $cust->cust_email ?? $email, // ใช้จาก DB ก่อน ถ้าไม่มีค่อยใช้จาก LINE
                            'avatar'   => $avatar,
                            'name'     => $name,
                            'is_update_mode' => true, // ตัวบอก View ว่านี่คือการ Update (เปลี่ยนหัวข้อ)

                            // ข้อมูลเดิมจาก Database (สำคัญมาก! ถ้าไม่ใส่ตรงนี้ ฟอร์มจะโล่ง)
                            'cust_firstname'   => $cust->cust_firstname,
                            'cust_lastname'    => $cust->cust_lastname,
                            'cust_tel'         => $cust->cust_tel,
                            'cust_gender'      => $cust->cust_gender,
                            'cust_birthdate'   => $cust->cust_birthdate,

                            // ข้อมูลที่อยู่
                            'cust_address'     => $cust->cust_address,
                            'cust_province'    => $cust->cust_province,
                            'cust_district'    => $cust->cust_district,
                            'cust_subdistrict' => $cust->cust_subdistrict,
                            'cust_zipcode'     => $cust->cust_zipcode,
                        ]
                    ]);

                    return redirect()->route('register.complete_profile')
                        ->with('error', 'คุณไม่ได้เข้าใช้งานนานเกิน 30 วัน กรุณาตรวจสอบข้อมูลและยืนยันตัวตน');
                }

                return $this->loginExistingUser($lineUser, $cust);
            }

            session([
                'social_register_data' => [
                    'provider' => 'line',
                    'line_id'  => $lineId,
                    'name'     => $name,
                    'email'    => $email,
                    'avatar'   => $avatar,
                ]
            ]);

            return redirect()->route('register.complete_profile');
        } catch (\Exception $e) {
            Log::error('LINE Login Error', ['msg' => $e->getMessage()]);
            return redirect()->route('login')->with('error', 'Login Failed');
        }
    }

    // ฟังก์ชั่นสำหรับ Login คนเก่า (Extract มาจาก Logic เดิมของคุณ)
    private function loginExistingUser($lineUser, $cust)
    {
        $lineId = $lineUser->getId();

        // Update User Model (Laravel Auth)
        $user = User::firstOrNew(['line_id' => $lineId]);
        if (!$user->exists) {
            $user->name = trim($cust->cust_firstname . ' ' . $cust->cust_lastname);
            $user->email = $cust->cust_email ?? $lineUser->getEmail();
            $user->password = bcrypt($lineId);
            $user->save();
        }

        // Update Customer Data บางส่วน
        $cust->cust_line  = $lineId;
        $cust->cust_email = $cust->cust_email ?: $lineUser->getEmail();
        $cust->save();

        // Check Tier Expiry (Logic เดิม)
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

        // Redirect
        $redirect = session('after_login_redirect') ?? '/dashboard';
        session()->forget(['referrer_code', 'after_login_redirect']);
        session(['line_avatar' => $lineUser->getAvatar(), 'line_email' => $user->email]);

        return redirect()->to($redirect);
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
                Log::error('❌ Tier History Error', ['msg' => $e->getMessage()]);
            }
        }
    }

    // public function redirectToLine()
    // {
    //     $redirectUrl = request()->query('redirect');
    //     // 1. ดักรับค่า ref (เช่น ?ref=ABC123) จากลิงก์ที่เพื่อนส่งมา
    //     $ref = request()->query('ref');

    //     if ($redirectUrl) {
    //         session(['after_login_redirect' => $redirectUrl]);
    //         Log::info('🔗 Saving redirect URL to session', ['url' => $redirectUrl]);
    //     }

    //     // 2. ถ้ามีค่า ref ให้บันทึกไว้ใน Session เพื่อนำไปใช้ตอน Callback
    //     if ($ref) {
    //         session(['referrer_code' => $ref]);
    //         Log::info('👥 Referral Code Detected in Redirect', ['ref_code' => $ref]);
    //     }

    //     return Socialite::driver('line')->redirect();
    // }

    // // เก่า 
    // // public function handleLineCallback()
    // // {
    // //     try {

    // //         Log::info('📥 LINE Callback Start', [
    // //             'session_redirect' => session('after_login_redirect'),
    // //             'session_id' => session()->getId(),
    // //             'state_param' => request()->query('state'),
    // //             'all_session' => session()->all(),
    // //         ]);

    // //         $lineUser = Socialite::driver('line')->user();

    // //         $lineId = $lineUser->getId();
    // //         $name   = $lineUser->getName() ?? '';
    // //         $email  = $lineUser->getEmail() ?? $lineId . '@line.local';
    // //         $avatar = $lineUser->getAvatar();

    // //         // dd($lineUser);
    // //         Log::info('LINE Login Response', [
    // //             'lineId' => $lineId,
    // //             'name'   => $name,
    // //             'email'  => $email,
    // //             'avatar' => $avatar,
    // //         ]);

    // //         $user = User::query()->firstOrNew(['line_id' => $lineId]);
    // //         if (!$user->exists) {
    // //             $user->name     = $name;
    // //             $user->email    = $email;
    // //             $user->password = Hash::make($lineId);
    // //         } else {
    // //             if (
    // //                 !empty($email) && (
    // //                     empty($user->email) ||
    // //                     str_ends_with($user->email, '@line.local')
    // //                 )
    // //             ) {
    // //                 $user->email = $email;
    // //             }
    // //         }

    // //         $cleanName = $this->removeEmoji($user->name ?? $name);
    // //         $user->save();


    // //         $cust = TblCustomerProd::firstOrNew(['cust_uid' => $lineId]);
    // //         $isNewCustomer = !$cust->exists;

    // //         if ($isNewCustomer) {
    // //             $cust->status              = 'enabled';
    // //             $cust->cust_type           = 'line';
    // //             $cust->cust_prefix         = 'mr';
    // //             $cust->cust_full_address   = '';
    // //             $cust->cust_address        = '';
    // //             $cust->cust_subdistrict    = '';
    // //             $cust->cust_district       = '';
    // //             $cust->cust_province       = '';
    // //             $cust->cust_zipcode        = '';
    // //             $cust->accept_news         = 'N';
    // //             $cust->accept_policy       = 'N';
    // //             $cust->accept_pdpa         = 'N';
    // //             $cust->accept_analyze_prod = 'N';
    // //             $cust->accept_marketing    = 'N';
    // //             $cust->unlockkey           = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    // //             $cust->cre_key             = now();
    // //             $cust->datetime            = now();

    // //             if (session()->has('referrer_code')) {
    // //                 $refCode = session('referrer_code');

    // //                 // ค้นหาว่ารหัสนี้เป็นของใครในระบบ
    // //                 $referrer = TblCustomerProd::where('referral_code', $refCode)->first();

    // //                 if ($referrer) {
    // //                     // เก็บ Line ID ของผู้แนะนำลงในช่อง referred_by
    // //                     $cust->referred_by = $referrer->cust_uid;
    // //                     Log::info('🎯 New user referred by', [
    // //                         'ref_code' => $refCode,
    // //                         'referrer_line_id' => $referrer->cust_uid
    // //                     ]);
    // //                 }
    // //             }
    // //             $cust->referral_code = strtoupper(substr(md5($lineId . time()), 0, 8));
    // //             $cust->cust_firstname = $cleanName;
    // //             $cust->cust_lastname  = '';
    // //         } else {
    // //             if (!empty($cust->cust_firstname)) {
    // //                 $user->name = trim($cust->cust_firstname . ' ' . $cust->cust_lastname);
    // //             }
    // //         }
    // //         $cust->cust_line  = $cust->cust_line ?: $lineId;
    // //         $cust->cust_email = $cust->cust_email ?: ($user->email ?? $email);

    // //         if (empty($cust->cust_tel) || trim($cust->cust_tel) === '') {
    // //             $cust->cust_tel = $user->phone ?? '';
    // //         }

    // //         $cust->save();
    // //         session()->forget('referrer_code');

    // //         // ตรวจสอบวันหมดอายุของ Tier ทุกครั้งที่ Login
    // //         if (!empty($cust->tier_expired_at)) {
    // //             $expiredAt = Carbon::parse($cust->tier_expired_at);
    // //             $now = Carbon::now();

    // //             // คำนวณเวลาคงเหลือ (วัน ชั่วโมง นาที)
    // //             $remainingDays = $now->diffInDays($expiredAt, false);
    // //             $remainingHours = $now->diffInHours($expiredAt, false);
    // //             $remainingText = $remainingDays > 0
    // //                 ? "{$remainingDays} วัน"
    // //                 : ($remainingHours > 0
    // //                     ? "{$remainingHours} ชั่วโมง"
    // //                     : "หมดอายุแล้ว");

    // //             Log::info("📊 Tier Check: ลูกค้าเข้าสู่ระบบ", [
    // //                 'cust_uid' => $cust->cust_uid,
    // //                 'tier' => $cust->tier_key,
    // //                 'expired_at' => $expiredAt->format('Y-m-d H:i:s'),
    // //                 'remaining' => $remainingText,
    // //                 'point' => $cust->point,
    // //             ]);

    // //             // if ($now->greaterThan($expiredAt)) {
    // //             //     Log::info("🔄 Tier หมดอายุแล้ว ทำการรีเซ็ตใหม่", [
    // //             //         'cust_uid' => $cust->cust_uid,
    // //             //         'old_tier' => $cust->tier_key,
    // //             //         'expired_at' => $cust->tier_expired_at,
    // //             //     ]);

    // //             //     // ✅ คำนวณ Tier ใหม่จาก point ปัจจุบัน
    // //             //     $point = (int) $cust->point;
    // //             //     $newTier = match (true) {
    // //             //         $point >= 3000 => 'platinum',
    // //             //         $point >= 1000 => 'gold',
    // //             //         default        => 'silver',
    // //             //     };

    // //             //     // ✅ ต่ออายุ Tier ใหม่อีก 2 ปี
    // //             //     $cust->update([
    // //             //         'tier_key'        => $newTier,
    // //             //         'tier_updated_at' => $now,
    // //             //         'tier_expired_at' => $now->copy()->addYears(2),
    // //             //     ]);

    // //             //     Log::info("✅ อัปเดต Tier ใหม่สำเร็จ", [
    // //             //         'new_tier' => $newTier,
    // //             //         'new_expired_at' => $cust->tier_expired_at,
    // //             //     ]);
    // //             // }

    // //             if ($now->greaterThan($expiredAt)) {
    // //                 Log::info("🔄 Tier หมดอายุแล้ว ทำการรีเซ็ตใหม่", [
    // //                     'cust_uid' => $cust->cust_uid,
    // //                     'old_tier' => $cust->tier_key,
    // //                     'expired_at' => $cust->tier_expired_at,
    // //                 ]);

    // //                 // เก็บ tier เดิมไว้ก่อนอัปเดต
    // //                 $oldTier = $cust->tier_key;
    // //                 $oldExpired = $cust->tier_expired_at;

    // //                 // คำนวณ Tier ใหม่จาก point ปัจจุบัน
    // //                 $point = (int) $cust->point;
    // //                 $newTier = match (true) {
    // //                     $point >= 3000 => 'platinum',
    // //                     $point >= 1000 => 'gold',
    // //                     default        => 'silver',
    // //                 };

    // //                 // ต่ออายุ Tier ใหม่อีก 2 ปี
    // //                 $newExpired = $now->copy()->addYears(2);
    // //                 $cust->update([
    // //                     'tier_key'        => $newTier,
    // //                     'tier_updated_at' => $now,
    // //                     'tier_expired_at' => $newExpired,
    // //                 ]);

    // //                 Log::info("✅ อัปเดต Tier ใหม่สำเร็จ", [
    // //                     'new_tier' => $newTier,
    // //                     'new_expired_at' => $newExpired,
    // //                 ]);

    // //                 // บันทึกประวัติการเปลี่ยน tier
    // //                 try {
    // //                     MembershipTierHistory::create([
    // //                         'user_id'       => $user->id,
    // //                         'cust_line'     => $cust->cust_line,
    // //                         'cust_tel'      => $cust->cust_tel,
    // //                         'tier_old'      => $oldTier,
    // //                         'tier_new'      => $newTier,
    // //                         'expired_at'    => $oldExpired,
    // //                         'changed_at'    => $now,
    // //                         'reason'        => 'expired',
    // //                         'point_at_time' => $point,
    // //                     ]);

    // //                     Log::info("🗂 บันทึกประวัติการหมดอายุ tier สำเร็จ", [
    // //                         'user_id' => $user->id,
    // //                         'tier_old' => $oldTier,
    // //                         'tier_new' => $newTier,
    // //                     ]);
    // //                 } catch (\Throwable $e) {
    // //                     Log::error('❌ บันทึกประวัติ tier ไม่สำเร็จ', [
    // //                         'error' => $e->getMessage(),
    // //                         'user_id' => $user->id,
    // //                     ]);
    // //                 }
    // //             }
    // //         }

    // //         // === แจกแต้มสมัครสมาชิกครั้งแรก ===
    // //         try {
    // //             DB::beginTransaction();

    // //             // แจกแต้มเฉพาะลูกค้าใหม่เท่านั้น
    // //             if ($isNewCustomer) {
    // //                 $process = TypeProcessPoint::where('process_code', 'REGISTER')
    // //                     ->where('is_active', 1)
    // //                     ->first();

    // //                 $initialPoint = $process?->default_point ?? 50;
    // //                 $pointBefore  = 0;
    // //                 $pointAfter   = $initialPoint;

    // //                 // กำหนด tier เริ่มต้นจากคะแนน
    // //                 $newTier = match (true) {
    // //                     $pointAfter >= 3000 => 'platinum',
    // //                     $pointAfter >= 1000 => 'gold',
    // //                     default             => 'silver',
    // //                 };

    // //                 $cust->update([
    // //                     'point'            => $pointAfter,
    // //                     'tier_key'         => $newTier,
    // //                     'tier_updated_at'  => now(),
    // //                     'tier_expired_at'  => now()->addYears(2),
    // //                     'last_earn_at'     => now(),
    // //                 ]);

    // //                 // บันทึกธุรกรรมแต้ม
    // //                 PointTransaction::create([
    // //                     'line_id'           => $lineId,
    // //                     'transaction_type'  => 'earn',
    // //                     'process_code'      => 'REGISTER',
    // //                     'reference_id'      => uniqid('TXN-'),
    // //                     'pid'               => null,
    // //                     'pname'             => 'สมัครสมาชิกครั้งแรก',
    // //                     'point_before'      => $pointBefore,
    // //                     'point_tran'        => $initialPoint,
    // //                     'point_after'       => $pointAfter,
    // //                     'tier'              => $newTier,
    // //                     'docdate'           => now()->toDateString(),
    // //                     'docno'             => sprintf('REG-%05d-%s', $cust->id ?? 0, now()->format('YmdHis')),
    // //                     'trandate'          => now()->toDateString(),
    // //                     'created_at'        => now(),
    // //                     'expired_at'        => now()->addYears(2)->toDateString(),
    // //                 ]);

    // //                 Log::info("✅ สมัครสมาชิกใหม่: เพิ่มแต้ม {$initialPoint} Points ให้ {$cust->cust_firstname}");
    // //             } else {
    // //                 Log::info(" ลูกค้า {$cust->cust_firstname} มีอยู่แล้ว — ไม่แจกแต้มสมัครสมาชิก");
    // //             }

    // //             DB::commit();
    // //         } catch (\Throwable $e) {
    // //             DB::rollBack();
    // //             Log::error('❌ แจกแต้มสมัครสมาชิกไม่สำเร็จ', ['error' => $e->getMessage()]);
    // //         }

    // //         Auth::login($user);

    // //         $redirect = session('after_login_redirect') ?? '/dashboard';
    // //         session()->forget('after_login_redirect');

    // //         Log::info('🚀 Redirecting after LINE login', [
    // //             'redirect_to' => $redirect,
    // //             'user_id' => $user->id
    // //         ]);

    // //         session([
    // //             'line_avatar' => $avatar,
    // //             'line_email'  => $email,
    // //         ]);

    // //         return redirect()->to($redirect);

    // //         Log::info('LINE Login Success', [
    // //             'user_id' => $user->id,
    // //             'name'    => $user->name,
    // //             'line_id' => $lineId,
    // //             'cust_tel' => $cust->cust_tel,
    // //         ]);

    // //         return redirect()->intended('dashboard');
    // //     } catch (\Exception $e) {
    // //         Log::error('LINE Login Error', [
    // //             'message' => $e->getMessage(),
    // //             'line'    => $e->getLine(),
    // //             'file'    => $e->getFile(),
    // //         ]);
    // //         return redirect()->route('login')->with('error', 'ล็อกอินผ่าน LINE ไม่สำเร็จ');
    // //     }
    // // }

    // public function handleLineCallback(Request $request)
    // {
    //     $logData = [
    //         'ip_address' => $request->ip(),
    //         'user_agent' => $request->userAgent(),
    //         'provider'   => 'line',
    //         'login_at'   => now(),
    //         'metadata'   => [],
    //     ];

    //     // เก็บ referrer code ลง metadata ถ้ามี
    //     if (session()->has('referrer_code')) {
    //         $logData['metadata']['referrer_code'] = session('referrer_code');
    //     }

    //     try {
    //         $lineUser = Socialite::driver('line')->user();
    //         $lineId   = $lineUser->getId();
    //         $name     = $lineUser->getName() ?? '';
    //         $email    = $lineUser->getEmail() ?? $lineId . '@line.local';
    //         $avatar   = $lineUser->getAvatar();
    //         $cleanName = $this->removeEmoji($name);

    //         // ใช้ DB Transaction ครอบคลุม Logic ทั้งหมดเพื่อความปลอดภัย
    //         $user = DB::transaction(function () use ($lineId, $name, $email, $cleanName) {

    //             // 1. จัดการข้อมูล User (Laravel Auth)
    //             $user = User::query()->firstOrNew(['line_id' => $lineId]);
    //             if (!$user->exists) {
    //                 $user->name     = $name;
    //                 $user->email    = $email;
    //                 $user->password = Hash::make($lineId);
    //             } else {
    //                 if (!empty($email) && (empty($user->email) || str_ends_with($user->email, '@line.local'))) {
    //                     $user->email = $email;
    //                 }
    //             }
    //             $user->save();

    //             // 2. จัดการข้อมูลลูกค้า (TblCustomerProd)
    //             $cust = TblCustomerProd::where('cust_uid', $lineId)->lockForUpdate()->first();
    //             $isNewCustomer = false;

    //             if (!$cust) {
    //                 $isNewCustomer = true;
    //                 $cust = new TblCustomerProd();
    //                 $this->createNewCustomer($cust, $lineId, $cleanName, $email);
    //             } else {
    //                 // ถ้ามีลูกค้าอยู่แล้ว อัปเดตชื่อใน User Model ตามฐานข้อมูลลูกค้า
    //                 if (!empty($cust->cust_firstname)) {
    //                     $user->name = trim($cust->cust_firstname . ' ' . $cust->cust_lastname);
    //                     $user->save();
    //                 }
    //             }

    //             $cust->cust_line  = $cust->cust_line ?: $lineId;
    //             $cust->cust_email = $cust->cust_email ?: $email;

    //             if (empty($cust->cust_tel) || trim($cust->cust_tel) === '') {
    //                 $cust->cust_tel = $user->phone ?? '';
    //             }
    //             $cust->save();

    //             // 3. แจกแต้มสมัครสมาชิกใหม่
    //             if ($isNewCustomer) {
    //                 $this->awardFirstRegistrationPoints($cust, $lineId);
    //             }

    //             // 4. ตรวจสอบการหมดอายุของ Tier
    //             $this->checkTierExpiry($cust, $user);

    //             return $user;
    //         });

    //         LoginLog::create(array_merge($logData, [
    //             'user_id' => $user->id,
    //             'line_id' => $lineId,
    //             'status'  => 'success',
    //         ]));

    //         // 5. ทำการ Login และ Redirect
    //         Auth::login($user);

    //         // ล้าง Session สำคัญ
    //         $redirect = session('after_login_redirect') ?? '/dashboard';
    //         session()->forget(['referrer_code', 'after_login_redirect']);

    //         session(['line_avatar' => $avatar, 'line_email' => $email]);

    //         return redirect()->to($redirect);
    //     } catch (\Exception $e) {

    //         $failedLineId = null;
    //         try {
    //             // อาจจะดึงไม่ได้ถ้า Error เกิดตอน connect socialite
    //             // แต่ถ้าดึงได้ก็ควรเก็บไว้
    //             if (isset($lineUser)) {
    //                 $failedLineId = $lineUser->getId();
    //             }
    //         } catch (\Exception $ex) {
    //         }

    //         LoginLog::create(array_merge($logData, [
    //             'user_id'        => null, // ยังไม่มี User ID เพราะ Login ไม่สำเร็จ
    //             'line_id'        => $failedLineId,
    //             'status'         => 'failed',
    //             'failure_reason' => $e->getMessage(), // เก็บ Error message ไว้ตรวจสอบ
    //         ]));

    //         Log::error('❌ LINE Callback Error', [
    //             'msg' => $e->getMessage(),
    //             'line' => $e->getLine()
    //         ]);
    //         return redirect()->route('login')->with('error', 'ล็อกอินผ่าน LINE ไม่สำเร็จ');
    //     }
    // }

    // private function createNewCustomer($cust, $lineId, $name, $email)
    // {
    //     $cust->status              = 'enabled';
    //     $cust->cust_type           = 'line';
    //     $cust->cust_prefix         = 'mr';
    //     $cust->cust_firstname      = $name;
    //     $cust->cust_lastname       = '';
    //     $cust->cust_uid            = $lineId;
    //     $cust->cust_full_address   = '';
    //     $cust->cust_address        = '';
    //     $cust->cust_subdistrict    = '';
    //     $cust->cust_district       = '';
    //     $cust->cust_province       = '';
    //     $cust->cust_zipcode        = '';
    //     $cust->accept_news         = 'N';
    //     $cust->accept_policy       = 'N';
    //     $cust->accept_pdpa         = 'N';
    //     $cust->accept_analyze_prod = 'N';
    //     $cust->accept_marketing    = 'N';
    //     $cust->unlockkey           = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    //     $cust->cre_key             = now();
    //     $cust->datetime            = now();

    //     // เช็คระบบแนะนำเพื่อน
    //     if (session()->has('referrer_code')) {
    //         $refCode = session('referrer_code');
    //         $referrer = TblCustomerProd::where('referral_code', $refCode)->first();

    //         // ป้องกันแนะนำตัวเอง และป้องกัน Duplicate ใน ReferralHistory
    //         if ($referrer && $referrer->cust_uid !== $lineId) {
    //             $exists = ReferralHistory::where('referee_uid', $lineId)->exists();

    //             if (!$exists) {
    //                 $cust->referred_by = $referrer->cust_uid;

    //                 $refHistory = ReferralHistory::create([
    //                     'referrer_uid'    => $referrer->cust_uid,
    //                     'referrer_name'   => $referrer->cust_firstname . ' ' . $referrer->cust_lastname,
    //                     'referee_uid'     => $lineId,
    //                     'referee_name'    => $name,
    //                     'process_code'    => 'FRIEND_REFERRAL',
    //                     'registered_at'   => now(),
    //                     'status_referrer' => 'pending',
    //                     'status_referee'  => 'rewarded',
    //                 ]);

    //                 $this->awardReferralPoints($refHistory);
    //             }
    //         }
    //     }

    //     $cust->referral_code = strtoupper(substr(md5($lineId . time()), 0, 8));
    // }

    // private function awardReferralPoints(ReferralHistory $refHistory)
    // {
    //     $referrer = TblCustomerProd::where('cust_uid', $refHistory->referrer_uid)->lockForUpdate()->first();
    //     $master = TypeProcessPoint::where('process_code', 'FRIEND_REFERRAL')->where('is_active', 1)->first();

    //     if ($referrer && $master) {
    //         $pointEarn = match ($referrer->tier_key) {
    //             'platinum' => $master->point_platinum,
    //             'gold'     => $master->point_gold,
    //             'silver'   => $master->point_silver,
    //             default    => $master->default_point,
    //         };

    //         $pointBefore = $referrer->point;
    //         $pointAfter  = $pointBefore + $pointEarn;

    //         PointTransaction::create([
    //             'line_id'          => $referrer->cust_uid,
    //             'transaction_type' => 'earn',
    //             'process_code'     => 'FRIEND_REFERRAL',
    //             'reference_id'     => $refHistory->id,
    //             'pname'            => 'แนะนำเพื่อนสำเร็จ: ' . $refHistory->referee_name,
    //             'point_before'     => $pointBefore,
    //             'point_tran'       => $pointEarn,
    //             'point_after'      => $pointAfter,
    //             'tier'             => $referrer->tier_key,
    //             'docdate'          => now()->toDateString(),
    //             'trandate'         => now()->toDateString(),
    //             'docno'            => 'REF-' . now()->format('YmdHis') . '-' . $refHistory->id,
    //             'created_at'       => now(),
    //         ]);

    //         $referrer->increment('point', $pointEarn);

    //         $refHistory->update([
    //             'status_referrer' => 'rewarded',
    //             'points_referrer' => $pointEarn,
    //             'rewarded_at'     => now()
    //         ]);
    //     }
    // }

    // private function awardFirstRegistrationPoints($cust, $lineId)
    // {
    //     try {
    //         DB::beginTransaction();
    //         $process = TypeProcessPoint::where('process_code', 'REGISTER')->where('is_active', 1)->first();
    //         $initialPoint = $process?->default_point ?? 50;

    //         $cust->update([
    //             'point'           => $initialPoint,
    //             'tier_key'        => 'silver',
    //             'tier_updated_at' => now(),
    //             'tier_expired_at' => now()->addYears(2),
    //             'last_earn_at'    => now(),
    //         ]);

    //         PointTransaction::create([
    //             'line_id'          => $lineId,
    //             'transaction_type' => 'earn',
    //             'process_code'     => 'REGISTER',
    //             'pname'            => 'สมัครสมาชิกครั้งแรก',
    //             'point_before'     => 0,
    //             'point_tran'       => $initialPoint,
    //             'point_after'      => $initialPoint,
    //             'tier'             => 'silver',
    //             'docdate'          => now()->toDateString(),
    //             'trandate'         => now()->toDateString(),
    //             'docno'            => 'REG-' . now()->format('YmdHis'),
    //             'created_at'       => now(),
    //             'expired_at'       => now()->addYears(2)->toDateString(),
    //         ]);
    //         DB::commit();
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         Log::error('❌ First Register Point Error', ['msg' => $e->getMessage()]);
    //     }
    // }

    // private function checkTierExpiry($cust, $user)
    // {
    //     if (empty($cust->tier_expired_at)) return;

    //     $expiredAt = Carbon::parse($cust->tier_expired_at);
    //     $now = Carbon::now();

    //     if ($now->greaterThan($expiredAt)) {
    //         $oldTier = $cust->tier_key;
    //         $oldExpired = $cust->tier_expired_at;
    //         $point = (int) $cust->point;

    //         $newTier = match (true) {
    //             $point >= 3000 => 'platinum',
    //             $point >= 1000 => 'gold',
    //             default        => 'silver',
    //         };

    //         $cust->update([
    //             'tier_key'        => $newTier,
    //             'tier_updated_at' => $now,
    //             'tier_expired_at' => $now->copy()->addYears(2),
    //         ]);

    //         try {
    //             MembershipTierHistory::create([
    //                 'user_id'       => $user->id,
    //                 'cust_line'     => $cust->cust_line,
    //                 'cust_tel'      => $cust->cust_tel,
    //                 'tier_old'      => $oldTier,
    //                 'tier_new'      => $newTier,
    //                 'expired_at'    => $oldExpired,
    //                 'changed_at'    => $now,
    //                 'reason'        => 'expired',
    //                 'point_at_time' => $point,
    //             ]);
    //         } catch (\Throwable $e) {
    //             Log::error('❌ Tier History Error', ['msg' => $e->getMessage()]);
    //         }
    //     }
    // }

    // private function removeEmoji($text)
    // {
    //     return preg_replace(
    //         '/[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]|[\x{1F900}-\x{1F9FF}]|[\x{1F1E6}-\x{1F1FF}]/u',
    //         '',
    //         $text
    //     );
    // }

}
