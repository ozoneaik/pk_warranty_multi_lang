<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminMenu;
use App\Models\RoleMenuPermission;
use App\Models\Admin; // <--- 1. เปลี่ยนจาก User เป็น Admin
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth; // <--- เพิ่ม Facade Auth
use Inertia\Inertia;

class AdminPermissionController extends Controller
{
    /**
     * จัดการสิทธิ์ระดับ Role (Global)
     */
    public function index()
    {
        // 1. รายการ Role ทั้งหมด (admin, staff, super_admin)
        $roles = ['admin', 'staff']; // หรือจะดึงจาก Admin::distinct('role')->pluck('role') ก็ได้

        // 2. รายการเมนูทั้งหมด
        $menus = AdminMenu::where('is_active', true)->orderBy('order')->get();

        // 3. ดึงสิทธิ์ปัจจุบันออกมา
        $permissions = RoleMenuPermission::all()->groupBy('role')
            ->map(fn($item) => $item->pluck('admin_menu_id'));

        return Inertia::render('Admin/User/Permissions', [
            'roles' => $roles,
            'menus' => $menus,
            'currentPermissions' => $permissions
        ]);
    }

    /**
     * อัปเดตสิทธิ์ระดับ Role (Global)
     */
    public function update(Request $request)
    {
        $data = $request->input('permissions'); // { admin: [1,2], staff: [1] }

        DB::transaction(function () use ($data) {
            RoleMenuPermission::truncate(); // ล้างข้อมูลทั้งหมด

            foreach ($data as $role => $menuIds) {
                foreach ($menuIds as $menuId) {
                    RoleMenuPermission::create([
                        'role' => $role,
                        'admin_menu_id' => $menuId
                    ]);
                }
            }
        });

        return back()->with('message', 'บันทึกสิทธิ์การเข้าถึงเรียบร้อยแล้ว');
    }

    /**
     * หน้าแก้ไขสิทธิ์รายบุคคล (Individual)
     */
    public function userPermissions($id) // รับ $id ของ Admin
    {
        // 1. เปลี่ยนมาใช้ Model Admin
        $targetAdmin = Admin::findOrFail($id);

        // 2. ป้องกันการแก้ไข Super Admin
        if ($targetAdmin->role === 'super_admin') {
            return back()->with('error', 'ไม่สามารถแก้ไขสิทธิ์ของ Super Admin ได้');
        }

        // 3. เช็คว่าคนทำรายการมีสิทธิ์ไหม (ใช้ guard admin)
        $currentUser = Auth::guard('admin')->user();
        if (!in_array($currentUser->role, ['super_admin', 'admin'])) {
            abort(403, 'เฉพาะผู้ดูแลระบบระดับสูงเท่านั้นที่จัดการสิทธิ์ได้');
        }

        $menus = AdminMenu::where('is_active', true)->orderBy('order')->get();

        // 4. ดึงสิทธิ์จากตาราง admin_menu_permissions
        $currentPermissions = DB::table('admin_menu_permissions') 
            ->where('admin_id', $id) 
            ->pluck('admin_menu_id');
        $individualPermissions = DB::table('admin_menu_permissions')
            ->where('admin_id', $id)
            ->pluck('admin_menu_id');
        $rolePermissionsMap = RoleMenuPermission::all()
            ->groupBy('role')
            ->map(fn($item) => $item->pluck('admin_menu_id'));
        $currentRolePermissions = $rolePermissionsMap[$targetAdmin->role] ?? collect([]);
        $mergedPermissions = $individualPermissions
            ->merge($currentRolePermissions)
            ->unique()
            ->values();
        return Inertia::render('Admin/User/UserPermissions', [
            'targetUser' => $targetAdmin,
            'menus' => $menus,
            'currentPermissions' => $mergedPermissions,
            'availableRoles' => ['super_admin', 'admin', 'staff'],
            'rolePermissionsMap' => $rolePermissionsMap,
        ]);
    }

    /**
     * บันทึกสิทธิ์รายบุคคล
     */
    public function updateUserPermissions(Request $request, $id)
    {
        $targetAdmin = Admin::findOrFail($id);

        if ($targetAdmin->role === 'super_admin') {
            abort(403, 'สิทธิ์ของ Super Admin ถูกล็อคโดยระบบ');
        }

        $request->validate([
            'role' => 'required|in:super_admin,admin,staff',
            'menu_ids' => 'array'
        ]);

        DB::transaction(function () use ($id, $request) {
            // 1. อัปเดต Role ที่ตาราง admins
            $admin = Admin::findOrFail($id);
            $admin->update(['role' => $request->role]);

            // 2. อัปเดตสิทธิ์เมนูที่ตาราง admin_menu_permissions
            DB::table('admin_menu_permissions')->where('admin_id', $id)->delete(); // <--- ลบของเก่า

            $menuIds = $request->input('menu_ids', []);

            // เตรียมข้อมูลสำหรับ insert
            $insertData = [];
            $now = now();

            foreach ($menuIds as $menuId) {
                $insertData[] = [
                    'admin_id' => $id,
                    'admin_menu_id' => $menuId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (!empty($insertData)) {
                DB::table('admin_menu_permissions')->insert($insertData);
            }
        });

        return back()->with('message', 'อัปเดตสิทธิ์และบทบาทเรียบร้อยแล้ว');
    }
}
