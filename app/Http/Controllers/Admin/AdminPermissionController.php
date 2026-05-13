<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminMenu;
use App\Models\RoleMenuPermission;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminPermissionController extends Controller
{
    /** จัดการสิทธิ์ระดับ Role (Global) */
    public function index()
    {
        $roles = ['admin', 'staff'];
        $menus = AdminMenu::where('is_active', true)->orderBy('order')->get();

        $permissions = RoleMenuPermission::all()
            ->groupBy('role')
            ->map(fn($items) => $items
                ->keyBy('admin_menu_id')
                ->map(fn($p) => $this->extractActions($p))
                ->mapWithKeys(fn($v, $k) => [(int) $k => $v])
            );

        return Inertia::render('Admin/User/Permissions', [
            'roles'              => $roles,
            'menus'              => $menus,
            'currentPermissions' => $permissions,
        ]);
    }

    /** อัปเดตสิทธิ์ระดับ Role (Global) */
    public function update(Request $request)
    {
        // รูปแบบข้อมูลที่รับ: { admin: { 1: {can_read, can_create, ...}, ... }, staff: {...} }
        $data = $request->input('permissions');

        DB::transaction(function () use ($data) {
            RoleMenuPermission::truncate();

            foreach ($data as $role => $menuPerms) {
                foreach ($menuPerms as $menuId => $actions) {
                    if ($this->hasAnyAction($actions)) {
                        RoleMenuPermission::create([
                            'role'          => $role,
                            'admin_menu_id' => $menuId,
                            ...$this->sanitizeActions($actions),
                        ]);
                    }
                }
            }
        });

        Cache::increment('admin_perms_version');

        Log::channel('admin')->info('Admin อัปเดตสิทธิ์ (Global)', [
            'admin_id' => Auth::guard('admin')->id(),
        ]);

        return back()->with('message', 'บันทึกสิทธิ์การเข้าถึงเรียบร้อยแล้ว');
    }

    /** หน้าแก้ไขสิทธิ์รายบุคคล */
    public function userPermissions(int $id)
    {
        $targetAdmin = Admin::findOrFail($id);

        if ($targetAdmin->role === 'super_admin') {
            return back()->with('error', 'ไม่สามารถแก้ไขสิทธิ์ของ Super Admin ได้');
        }

        $currentUser = Auth::guard('admin')->user();
        if (!in_array($currentUser->role, ['super_admin', 'admin'])) {
            abort(403, 'เฉพาะผู้ดูแลระบบระดับสูงเท่านั้นที่จัดการสิทธิ์ได้');
        }

        $menus = AdminMenu::where('is_active', true)->orderBy('order')->get();

        // สิทธิ์ตาม Role ของ user คนนี้
        $rolePerms = DB::table('role_menu_permissions')
            ->where('role', $targetAdmin->role)
            ->get(['admin_menu_id', 'can_read', 'can_create', 'can_update', 'can_delete'])
            ->keyBy('admin_menu_id');

        // สิทธิ์รายบุคคล
        $individualPerms = DB::table('admin_menu_permissions')
            ->where('admin_id', $id)
            ->get(['admin_menu_id', 'can_read', 'can_create', 'can_update', 'can_delete'])
            ->keyBy('admin_menu_id');

        // Merge: OR ของ role + individual (สิ่งที่ user เข้าถึงได้จริง)
        $allMenuIds = $rolePerms->keys()->merge($individualPerms->keys())->unique();
        $currentPermissions = $allMenuIds->mapWithKeys(fn($menuId) => [
            (int) $menuId => [
                'can_read'   => (bool) (($rolePerms[$menuId]->can_read   ?? false) || ($individualPerms[$menuId]->can_read   ?? false)),
                'can_create' => (bool) (($rolePerms[$menuId]->can_create ?? false) || ($individualPerms[$menuId]->can_create ?? false)),
                'can_update' => (bool) (($rolePerms[$menuId]->can_update ?? false) || ($individualPerms[$menuId]->can_update ?? false)),
                'can_delete' => (bool) (($rolePerms[$menuId]->can_delete ?? false) || ($individualPerms[$menuId]->can_delete ?? false)),
            ]
        ]);

        // Role defaults map (สำหรับ autofill เมื่อเปลี่ยน role บน frontend)
        $rolePermissionsMap = RoleMenuPermission::all()
            ->groupBy('role')
            ->map(fn($items) => $items
                ->keyBy('admin_menu_id')
                ->map(fn($p) => $this->extractActions($p))
                ->mapWithKeys(fn($v, $k) => [(int) $k => $v])
            );

        return Inertia::render('Admin/User/UserPermissions', [
            'targetUser'         => $targetAdmin,
            'menus'              => $menus,
            'currentPermissions' => $currentPermissions,
            'availableRoles'     => ['super_admin', 'admin', 'staff'],
            'rolePermissionsMap' => $rolePermissionsMap,
        ]);
    }

    /** บันทึกสิทธิ์รายบุคคล */
    public function updateUserPermissions(Request $request, int $id)
    {
        $targetAdmin = Admin::findOrFail($id);

        if ($targetAdmin->role === 'super_admin') {
            abort(403, 'สิทธิ์ของ Super Admin ถูกล็อคโดยระบบ');
        }

        $request->validate([
            'role'        => 'required|in:super_admin,admin,staff',
            'permissions' => 'array',
        ]);

        DB::transaction(function () use ($id, $request) {
            Admin::findOrFail($id)->update(['role' => $request->role]);

            DB::table('admin_menu_permissions')->where('admin_id', $id)->delete();

            $permissions = $request->input('permissions', []);
            $now = now();
            $insertData = [];

            foreach ($permissions as $menuId => $actions) {
                if ($this->hasAnyAction($actions)) {
                    $insertData[] = [
                        'admin_id'      => $id,
                        'admin_menu_id' => $menuId,
                        'created_at'    => $now,
                        'updated_at'    => $now,
                        ...$this->sanitizeActions($actions),
                    ];
                }
            }

            if (!empty($insertData)) {
                DB::table('admin_menu_permissions')->insert($insertData);
            }
        });

        Cache::increment('admin_perms_version');

        Log::channel('admin')->info('Admin อัปเดตสิทธิ์รายบุคคล', [
            'admin_id'  => Auth::guard('admin')->id(),
            'target_id' => $id,
        ]);

        return back()->with('message', 'อัปเดตสิทธิ์และบทบาทเรียบร้อยแล้ว');
    }

    private function extractActions(object $p): array
    {
        return [
            'can_read'   => (bool) $p->can_read,
            'can_create' => (bool) $p->can_create,
            'can_update' => (bool) $p->can_update,
            'can_delete' => (bool) $p->can_delete,
        ];
    }

    private function sanitizeActions(array $actions): array
    {
        return [
            'can_read'   => (bool) ($actions['can_read']   ?? false),
            'can_create' => (bool) ($actions['can_create'] ?? false),
            'can_update' => (bool) ($actions['can_update'] ?? false),
            'can_delete' => (bool) ($actions['can_delete'] ?? false),
        ];
    }

    private function hasAnyAction(array $actions): bool
    {
        return ($actions['can_read']   ?? false)
            || ($actions['can_create'] ?? false)
            || ($actions['can_update'] ?? false)
            || ($actions['can_delete'] ?? false);
    }
}
