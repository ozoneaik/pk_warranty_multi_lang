<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\MembershipTierHistory;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TypeProcessPoint;
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
    // public function redirectToLine()
    // {
    //     return Socialite::driver('line')->redirect();
    // }

    // public function handleLineCallback()
    // {
    //     try {
    //         $lineUser = Socialite::driver('line')->user();
    //         $findUser = User::query()->where('line_id', $lineUser->getId())->first();
    //         if ($findUser) {
    //             Auth::login($findUser);
    //             return redirect()->intended('dashboard');
    //         } else {
    //             if ($lineUser->getEmail() === null) {
    //                 $randomEmail = $lineUser->getId() . '@line.local';
    //             } else {
    //                 $randomEmail = $lineUser->getEmail();
    //             }
    //             $newUser = User::query()->updateOrCreate(['line_id' => $lineUser->getId()], [
    //                 'line_id' => $lineUser->getId(),
    //                 'name' => $lineUser->getName(),
    //                 'email' => $randomEmail,
    //                 'password' => Hash::make($lineUser->getId())
    //             ]);
    //             Auth::login($newUser);
    //             return redirect()->intended('dashboard');
    //         }
    //     } catch (\Exception $e) {
    //         dd($e->getMessage());
    //     }
    // }

    public function redirectToLine()
    {
        // return Socialite::driver('line')->redirect();
        return Socialite::driver('line')
            ->scopes(['profile', 'openid', 'email'])
            ->redirect();
    }

    // public function handleLineCallback()
    // {
    //     try {
    //         $lineUser = Socialite::driver('line')->user();

    //         $lineId = $lineUser->getId();
    //         $name   = $lineUser->getName() ?? '';
    //         $email  = $lineUser->getEmail() ?? $lineId . '@line.local';
    //         $avatar = $lineUser->getAvatar();

    //         Log::info('LINE Login Response', [
    //             'lineId' => $lineId,
    //             'name'   => $name,
    //             'email'  => $email,
    //             'avatar' => $avatar,
    //         ]);

    //         $user = User::query()->firstOrNew(['line_id' => $lineId]);
    //         if (!$user->exists) {
    //             $user->name     = $name;
    //             $user->email    = $email;
    //             $user->password = Hash::make($lineId);
    //         } else {
    //             if (
    //                 !empty($email) && (
    //                     empty($user->email) ||
    //                     str_ends_with($user->email, '@line.local')
    //                 )
    //             ) {
    //                 $user->email = $email;
    //             }
    //         }

    //         $cleanName = $this->removeEmoji($user->name ?? $name);
    //         $cust = TblCustomerProd::firstOrNew(['cust_uid' => $lineId]);

    //         if ($cust->exists) {
    //             if (!empty($cust->cust_firstname)) {
    //                 $user->name = trim($cust->cust_firstname . ' ' . $cust->cust_lastname);
    //             }
    //         } else {
    //             $cust->status              = 'enabled';
    //             $cust->cust_type           = 'line';
    //             $cust->cust_prefix         = 'mr';
    //             $cust->cust_full_address   = '';
    //             $cust->cust_address        = '';
    //             $cust->cust_subdistrict    = '';
    //             $cust->cust_district       = '';
    //             $cust->cust_province       = '';
    //             $cust->cust_zipcode        = '';
    //             $cust->accept_news         = 'N';
    //             $cust->accept_policy       = 'N';
    //             $cust->accept_pdpa         = 'N';
    //             $cust->accept_analyze_prod = 'N';
    //             $cust->accept_marketing    = 'N';
    //             $cust->unlockkey           = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    //             $cust->cre_key             = now();
    //             $cust->datetime            = now();

    //             $cust->cust_firstname = $cleanName;
    //             $cust->cust_lastname  = '';
    //         }

    //         $cust->cust_line  = $cust->cust_line  ?: $lineId;
    //         $cust->cust_email = $cust->cust_email ?: ($user->email ?? $email);

    //         if (
    //             empty($cust->cust_tel) ||
    //             trim($cust->cust_tel) === '' ||
    //             $cust->cust_tel !== $user->phone
    //         ) {
    //             $cust->cust_tel = $user->phone ?? '';
    //         }

    //         $user->save();
    //         $cust->save();

    //         Auth::login($user);
    //         session([
    //             'line_avatar' => $avatar,
    //             'line_email'  => $email,
    //         ]);

    //         Log::info('LINE Login Success', [
    //             'user_id' => $user->id,
    //             'name'    => $user->name,
    //             'line_id' => $lineId,
    //         ]);

    //         return redirect()->intended('dashboard');
    //     } catch (\Exception $e) {
    //         Log::error('LINE Login Error', [
    //             'message' => $e->getMessage(),
    //             'line'    => $e->getLine(),
    //             'file'    => $e->getFile(),
    //         ]);
    //         return redirect()->route('login')->with('error', 'ล็อกอินผ่าน LINE ไม่สำเร็จ');
    //     }
    // }

    public function handleLineCallback()
    {
        try {
            $lineUser = Socialite::driver('line')->user();

            $lineId = $lineUser->getId();
            $name   = $lineUser->getName() ?? '';
            $email  = $lineUser->getEmail() ?? $lineId . '@line.local';
            $avatar = $lineUser->getAvatar();

            Log::info('LINE Login Response', [
                'lineId' => $lineId,
                'name'   => $name,
                'email'  => $email,
                'avatar' => $avatar,
            ]);

            $user = User::query()->firstOrNew(['line_id' => $lineId]);
            if (!$user->exists) {
                $user->name     = $name;
                $user->email    = $email;
                $user->password = Hash::make($lineId);
            } else {
                if (
                    !empty($email) && (
                        empty($user->email) ||
                        str_ends_with($user->email, '@line.local')
                    )
                ) {
                    $user->email = $email;
                }
            }

            $cleanName = $this->removeEmoji($user->name ?? $name);
            $user->save();
            $cust = TblCustomerProd::firstOrNew(['cust_uid' => $lineId]);

            if (!$cust->exists) {
                $cust->status              = 'enabled';
                $cust->cust_type           = 'line';
                $cust->cust_prefix         = 'mr';
                $cust->cust_full_address   = '';
                $cust->cust_address        = '';
                $cust->cust_subdistrict    = '';
                $cust->cust_district       = '';
                $cust->cust_province       = '';
                $cust->cust_zipcode        = '';
                $cust->accept_news         = 'N';
                $cust->accept_policy       = 'N';
                $cust->accept_pdpa         = 'N';
                $cust->accept_analyze_prod = 'N';
                $cust->accept_marketing    = 'N';
                $cust->unlockkey           = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $cust->cre_key             = now();
                $cust->datetime            = now();

                $cust->cust_firstname = $cleanName;
                $cust->cust_lastname  = '';
            } else {
                if (!empty($cust->cust_firstname)) {
                    $user->name = trim($cust->cust_firstname . ' ' . $cust->cust_lastname);
                }
            }
            $cust->cust_line  = $cust->cust_line ?: $lineId;
            $cust->cust_email = $cust->cust_email ?: ($user->email ?? $email);

            if (empty($cust->cust_tel) || trim($cust->cust_tel) === '') {
                $cust->cust_tel = $user->phone ?? '';
            }
            $cust->save();

            // ✅ ตรวจสอบวันหมดอายุของ Tier ทุกครั้งที่ Login
            if (!empty($cust->tier_expired_at)) {
                $expiredAt = Carbon::parse($cust->tier_expired_at);
                $now = Carbon::now();

                // ✅ คำนวณเวลาคงเหลือ (วัน ชั่วโมง นาที)
                $remainingDays = $now->diffInDays($expiredAt, false);
                $remainingHours = $now->diffInHours($expiredAt, false);
                $remainingText = $remainingDays > 0
                    ? "{$remainingDays} วัน"
                    : ($remainingHours > 0
                        ? "{$remainingHours} ชั่วโมง"
                        : "หมดอายุแล้ว");

                Log::info("📊 Tier Check: ลูกค้าเข้าสู่ระบบ", [
                    'cust_uid' => $cust->cust_uid,
                    'tier' => $cust->tier_key,
                    'expired_at' => $expiredAt->format('Y-m-d H:i:s'),
                    'remaining' => $remainingText,
                    'point' => $cust->point,
                ]);

                // if ($now->greaterThan($expiredAt)) {
                //     Log::info("🔄 Tier หมดอายุแล้ว ทำการรีเซ็ตใหม่", [
                //         'cust_uid' => $cust->cust_uid,
                //         'old_tier' => $cust->tier_key,
                //         'expired_at' => $cust->tier_expired_at,
                //     ]);

                //     // ✅ คำนวณ Tier ใหม่จาก point ปัจจุบัน
                //     $point = (int) $cust->point;
                //     $newTier = match (true) {
                //         $point >= 3000 => 'platinum',
                //         $point >= 1000 => 'gold',
                //         default        => 'silver',
                //     };

                //     // ✅ ต่ออายุ Tier ใหม่อีก 2 ปี
                //     $cust->update([
                //         'tier_key'        => $newTier,
                //         'tier_updated_at' => $now,
                //         'tier_expired_at' => $now->copy()->addYears(2),
                //     ]);

                //     Log::info("✅ อัปเดต Tier ใหม่สำเร็จ", [
                //         'new_tier' => $newTier,
                //         'new_expired_at' => $cust->tier_expired_at,
                //     ]);
                // }

                if ($now->greaterThan($expiredAt)) {
                    Log::info("🔄 Tier หมดอายุแล้ว ทำการรีเซ็ตใหม่", [
                        'cust_uid' => $cust->cust_uid,
                        'old_tier' => $cust->tier_key,
                        'expired_at' => $cust->tier_expired_at,
                    ]);

                    // เก็บ tier เดิมไว้ก่อนอัปเดต
                    $oldTier = $cust->tier_key;
                    $oldExpired = $cust->tier_expired_at;

                    // คำนวณ Tier ใหม่จาก point ปัจจุบัน
                    $point = (int) $cust->point;
                    $newTier = match (true) {
                        $point >= 3000 => 'platinum',
                        $point >= 1000 => 'gold',
                        default        => 'silver',
                    };

                    // ต่ออายุ Tier ใหม่อีก 2 ปี
                    $newExpired = $now->copy()->addYears(2);
                    $cust->update([
                        'tier_key'        => $newTier,
                        'tier_updated_at' => $now,
                        'tier_expired_at' => $newExpired,
                    ]);

                    Log::info("✅ อัปเดต Tier ใหม่สำเร็จ", [
                        'new_tier' => $newTier,
                        'new_expired_at' => $newExpired,
                    ]);

                    // บันทึกประวัติการเปลี่ยน tier
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

                        Log::info("🗂 บันทึกประวัติการหมดอายุ tier สำเร็จ", [
                            'user_id' => $user->id,
                            'tier_old' => $oldTier,
                            'tier_new' => $newTier,
                        ]);
                    } catch (\Throwable $e) {
                        Log::error('❌ บันทึกประวัติ tier ไม่สำเร็จ', [
                            'error' => $e->getMessage(),
                            'user_id' => $user->id,
                        ]);
                    }
                }
            }

            // === แจกแต้มสมัครสมาชิกครั้งแรก ===
            try {
                DB::beginTransaction();

                // แจกแต้มเฉพาะลูกค้าใหม่เท่านั้น
                if (!$cust->exists || !$cust->id) {
                    $process = TypeProcessPoint::where('process_code', 'REGISTER')
                        ->where('is_active', 1)
                        ->first();

                    $initialPoint = $process?->default_point ?? 50;
                    $pointBefore  = 0;
                    $pointAfter   = $initialPoint;

                    // กำหนด tier เริ่มต้นจากคะแนน
                    $newTier = match (true) {
                        $pointAfter >= 3000 => 'platinum',
                        $pointAfter >= 1000 => 'gold',
                        default             => 'silver',
                    };

                    $cust->update([
                        'point'            => $pointAfter,
                        'tier_key'         => $newTier,
                        'tier_updated_at'  => now(),
                        'tier_expired_at'  => now()->addYears(2),
                        'last_earn_at'     => now(),
                    ]);

                    // บันทึกธุรกรรมแต้ม
                    PointTransaction::create([
                        'line_id'           => $lineId,
                        'transaction_type'  => 'earn',
                        'process_code'      => 'REGISTER',
                        'reference_id'      => uniqid('TXN-'),
                        'pid'               => null,
                        'pname'             => 'สมัครสมาชิกครั้งแรก',
                        'point_before'      => $pointBefore,
                        'point_tran'        => $initialPoint,
                        'point_after'       => $pointAfter,
                        'tier'              => $newTier,
                        'docdate'           => now()->toDateString(),
                        'docno'             => sprintf('REG-%05d-%s', $cust->id ?? 0, now()->format('YmdHis')),
                        'trandate'          => now()->toDateString(),
                        'created_at'        => now(),
                        'expired_at'        => now()->addYears(2)->toDateString(),
                    ]);

                    Log::info("✅ สมัครสมาชิกใหม่: เพิ่มแต้ม {$initialPoint} Points ให้ {$cust->cust_firstname}");
                } else {
                    Log::info(" ลูกค้า {$cust->cust_firstname} มีอยู่แล้ว — ไม่แจกแต้มสมัครสมาชิก");
                }

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::error('❌ แจกแต้มสมัครสมาชิกไม่สำเร็จ', ['error' => $e->getMessage()]);
            }

            Auth::login($user);
            session([
                'line_avatar' => $avatar,
                'line_email'  => $email,
            ]);
            Log::info('LINE Login Success', [
                'user_id' => $user->id,
                'name'    => $user->name,
                'line_id' => $lineId,
                'cust_tel' => $cust->cust_tel,
            ]);

            return redirect()->intended('dashboard');
        } catch (\Exception $e) {
            Log::error('LINE Login Error', [
                'message' => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
            ]);
            return redirect()->route('login')->with('error', 'ล็อกอินผ่าน LINE ไม่สำเร็จ');
        }
    }

    private function removeEmoji($text)
    {
        return preg_replace(
            '/[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]|[\x{1F900}-\x{1F9FF}]|[\x{1F1E6}-\x{1F1FF}]/u',
            '',
            $text
        );
    }
}
