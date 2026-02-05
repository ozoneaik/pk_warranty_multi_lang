<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminAuthController extends Controller
{
    //
    // แสดงหน้า Login
    public function create()
    {
        return Inertia::render('Admin/Auth/Login'); // ต้องสร้างไฟล์ Vue/React หน้านี้
    }

    // ประมวลผลการ Login
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // สำคัญ: ใช้ guard('admin')
        if (Auth::guard('admin')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // ตรวจสอบสิทธิ์เพิ่มเติม (ถ้าจำเป็น) เช่น check role
            // if (!Auth::guard('admin')->user()->is_admin) {
            //      Auth::guard('admin')->logout();
            //      return back()->withErrors(['email' => 'Access denied.']);
            // }

            return redirect()->intended(route('admin.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    // ออกจากระบบ
    public function destroy(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
