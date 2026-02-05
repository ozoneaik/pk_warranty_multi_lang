<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminProfileController extends Controller
{
    /**
     * แสดงหน้าฟอร์มแก้ไขโปรไฟล์
     */
    public function edit(Request $request)
    {
        return Inertia::render('Admin/Profile/Edit', [
            // ส่งข้อมูลสถานะ session ไปด้วย (เช่น saved)
            'status' => session('status'),
        ]);
    }

    /**
     * อัปเดตข้อมูลทั่วไป (ชื่อ, อีเมล, เบอร์)
     */
    public function update(Request $request)
    {
        $user = Auth::guard('admin')->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('admins')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user->fill($validated);
        $user->save();

        return redirect()->route('admin.profile.edit')->with('message', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
    }

    /**
     * อัปเดตรหัสผ่าน
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password:admin'], // ใช้ guard admin
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $request->user('admin')->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('message', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
    }
}
