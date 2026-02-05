<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        // 2. ดึง ID ของ Admin ที่ Login อยู่ โดยระบุ guard 'admin'
        $currentAdminId = Auth::guard('admin')->id();
        $currentAdminUser = Auth::guard('admin')->user();

        // เริ่มสร้าง Query โดยยกเว้น ID ของตัวเอง
        $query = Admin::query()->where('id', '!=', $currentAdminId);

        // ถ้าไม่ใช่ super_admin อาจจะมองไม่เห็น super_admin คนอื่น (Optional)
        if ($currentAdminUser->role !== 'super_admin') {
            $query->where('role', '!=', 'super_admin');
        }

        // 3. เงื่อนไขการค้นหา
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $admins = $query->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/User/Index', [ // ชื่อไฟล์ Vue อาจจะเปลี่ยนเป็น Admin/Management/Index ก็ได้แล้วแต่คุณ
            'users' => $admins, // ส่งตัวแปรชื่อ users หรือ admins ก็ได้ (แต่ใน Vue ต้องเรียกให้ถูก)
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/User/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // 4. เช็ค unique ที่ตาราง admins
            'email' => 'required|string|email|max:255|unique:admins',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:super_admin,admin,staff', // ตัด user ออก หรือเก็บไว้ถ้ามี role นี้ในระบบ admin
            'phone' => 'nullable|string|max:20', // เพิ่ม phone ตามโครงสร้างใหม่
            // 'status' => 'required|in:active,inactive', // (ถ้าคุณเพิ่ม status แล้ว)
        ]);

        Admin::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $request->phone ?? null,
            // 'status' => $request->status ?? 'active',
        ]);

        return redirect()->route('admin.users.index')->with('message', 'สร้างผู้ดูแลระบบใหม่สำเร็จ');
    }

    public function edit($id)
    {
        // ตรวจสอบสิทธิ์: ถ้าไม่ใช่ Super Admin ห้ามเข้า
        if (Auth::guard('admin')->user()->role !== 'super_admin') {
            abort(403, 'คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้อื่น');
        }

        $admin = Admin::findOrFail($id);
        return Inertia::render('Admin/User/Edit', ['user' => $admin]);
    }

    public function update(Request $request, $id)
    {
        // ตรวจสอบสิทธิ์อีกครั้งเพื่อความปลอดภัย
        if (Auth::guard('admin')->user()->role !== 'super_admin') {
            abort(403, 'คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้อื่น');
        }

        $admin = Admin::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('admins')->ignore($admin->id)],
            'role' => 'required|in:super_admin,admin,staff',
            // 'password' => 'nullable|string|min:8|confirmed', // ถ้าต้องการให้แก้รหัสผ่านด้วย ให้เปิดบรรทัดนี้
        ]);

        $admin->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ]);

        // ถ้ามีการส่ง password มาใหม่ ถึงจะอัปเดต (Optional)
        if ($request->filled('password')) {
            $admin->update(['password' => Hash::make($request->password)]);
        }

        return redirect()->route('admin.users.index')->with('message', 'อัปเดตข้อมูลผู้ใช้สำเร็จ');
    }

    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);

        // 1. ห้ามลบตัวเอง (เช็คจาก Guard admin)
        if ($admin->id === Auth::guard('admin')->id()) {
            return back()->with('error', 'คุณไม่สามารถลบตัวเองได้');
        }

        // 2. ห้ามลบ Super Admin
        if ($admin->role === 'super_admin') {
            return back()->with('error', 'ไม่สามารถลบผู้ดูแลระบบสูงสุดได้');
        }

        $admin->delete();

        return back()->with('message', 'ลบผู้ดูแลระบบเรียบร้อยแล้ว');
    }
}
