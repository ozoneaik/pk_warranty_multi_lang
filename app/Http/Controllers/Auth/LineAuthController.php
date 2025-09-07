<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class LineAuthController extends Controller
{
    public function redirectToLine()
    {
        return Socialite::driver('line')->redirect();
    }

    public function handleLineCallback()
    {
        try {
            $lineUser = Socialite::driver('line')->user();
            $findUser = User::query()->where('line_id', $lineUser->getId())->first();
            if ($findUser) {
                Auth::login($findUser);
                return redirect()->intended('dashboard');
            } else {
                if ($lineUser->getEmail() === null) {
                    $randomEmail = $lineUser->getId() . '@line.local';
                } else {
                    $randomEmail = $lineUser->getEmail();
                }
                $newUser = User::query()->updateOrCreate(['line_id' => $lineUser->getId()], [
                    'line_id' => $lineUser->getId(),
                    'name' => $lineUser->getName(),
                    'email' => $randomEmail,
                    'password' => Hash::make($lineUser->getId())
                ]);
                Auth::login($newUser);
                return redirect()->intended('dashboard');
            }
        } catch (\Exception $e) {
            dd($e->getMessage());
        }
    }
}
