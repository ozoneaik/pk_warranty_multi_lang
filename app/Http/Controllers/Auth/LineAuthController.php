<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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