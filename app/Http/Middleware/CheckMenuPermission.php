<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckMenuPermission
{
    public function handle(Request $request, Closure $next, string $menuKey, string $action = 'read'): Response
    {
        $user = Auth::user();

        // 1. ถ้าเป็น super_admin ให้ผ่านได้ทุกหน้าเสมอ
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        $version = Cache::get('admin_perms_version', 1);
        $cacheKey = "admin_perm_{$version}_{$user->id}_{$menuKey}_{$action}";
        $column   = 'can_' . $action;

        $hasPermission = Cache::remember($cacheKey, 300, function () use ($user, $menuKey, $column) {
            $menuId = DB::table('admin_menus')->where('key', $menuKey)->value('id');

            if (!$menuId) {
                return false;
            }

            $fromRole = DB::table('role_menu_permissions')
                ->where('role', $user->role)
                ->where('admin_menu_id', $menuId)
                ->where($column, true)
                ->exists();

            if ($fromRole) {
                return true;
            }

            return DB::table('admin_menu_permissions')
                ->where('admin_id', $user->id)
                ->where('admin_menu_id', $menuId)
                ->where($column, true)
                ->exists();
        });

        if (!$hasPermission) {
            // ถ้าไม่มีสิทธิ์ ให้ดีดกลับหรือแสดง Error 403
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
        }

        return $next($request);
    }
}
