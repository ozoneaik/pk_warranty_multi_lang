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
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $menuKey): Response
    {
        $user = Auth::user();

        // 1. ถ้าเป็น super_admin ให้ผ่านได้ทุกหน้าเสมอ
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // 2. ดึงสิทธิ์จาก Role และ สิทธิ์รายบุคคล มารวมกัน (cache 5 นาที)
        $version = Cache::get('admin_perms_version', 1);
        $cacheKey = "admin_perm_{$version}_{$user->id}_{$menuKey}";

        $hasPermission = Cache::remember($cacheKey, 300, function () use ($user, $menuKey) {
            return DB::table('admin_menus')
                ->where('key', $menuKey)
                ->where(function ($query) use ($user) {
                    $query->whereIn('id', function ($q) use ($user) {
                        $q->select('admin_menu_id')
                            ->from('role_menu_permissions')
                            ->where('role', $user->role);
                    })
                        ->orWhereIn('id', function ($q) use ($user) {
                            $q->select('admin_menu_id')
                                ->from('admin_menu_permissions')
                                ->where('admin_id', $user->id);
                        });
                })
                ->exists();
        });

        if (!$hasPermission) {
            // ถ้าไม่มีสิทธิ์ ให้ดีดกลับหรือแสดง Error 403
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
        }

        return $next($request);
    }
}
