<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckMenuPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    // public function handle(Request $request, Closure $next, string $menuKey): Response
    // {
    //     $user = Auth::user();

    //     // 1. ถ้าเป็น super_admin ให้ผ่านได้ทุกหน้าเสมอ
    //     if ($user->role === 'super_admin') {
    //         return $next($request);
    //     }

    //     // 2. ดึงสิทธิ์จาก Role และ สิทธิ์รายบุคคล มารวมกัน
    //     $hasPermission = DB::table('admin_menus')
    //         ->where('key', $menuKey) // เช็คจาก key ที่ส่งมาจาก middleware
    //         ->where(function ($query) use ($user) {
    //             $query->whereIn('id', function ($q) use ($user) {
    //                 // เช็คจากสิทธิ์ตาม Role
    //                 $q->select('admin_menu_id')
    //                     ->from('role_menu_permissions')
    //                     ->where('role', $user->role);
    //             })
    //                 ->orWhereIn('id', function ($q) use ($user) {
    //                     // เช็คจากสิทธิ์รายบุคคล
    //                     $q->select('admin_menu_id')
    //                         ->from('admin_menu_permissions')
    //                         ->where('admin_id', $user->id);
    //                 });
    //         })
    //         ->exists();

    //     if (!$hasPermission) {
    //         // ถ้าไม่มีสิทธิ์ ให้ดีดกลับหรือแสดง Error 403
    //         abort(403, 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
    //     }

    //     return $next($request);
    // }
    public function handle(Request $request, Closure $next, string $menuKey): Response
    {
        // 1. ระบุ Guard 'admin' ให้ชัดเจน
        $admin = Auth::guard('admin')->user();

        // ตรวจสอบว่าได้ Login ในฐานะ Admin หรือไม่
        if (!$admin) {
            return redirect()->route('admin.login');
        }

        // 2. ถ้าเป็น super_admin ให้ผ่านได้ทุกหน้าเสมอ
        if ($admin->role === 'super_admin') {
            return $next($request);
        }

        // 3. เช็คสิทธิ์การเข้าถึงเมนูผ่าน key
        $hasPermission = DB::table('admin_menus')
            ->where('key', $menuKey)
            ->where('is_active', true) // ควรเช็คด้วยว่าเมนูนั้นเปิดใช้งานอยู่
            ->where(function ($query) use ($admin) {
                $query->whereIn('id', function ($q) use ($admin) {
                    // สิทธิ์ตามกลุ่ม Role
                    $q->select('admin_menu_id')
                        ->from('role_menu_permissions')
                        ->where('role', $admin->role);
                })
                    ->orWhereIn('id', function ($q) use ($admin) {
                        // สิทธิ์เฉพาะรายบุคคล (ใช้ admin_id ให้ตรงกับ Model Admin)
                        $q->select('admin_menu_id')
                            ->from('admin_menu_permissions')
                            ->where('admin_id', $admin->id);
                    });
            })
            ->exists();

        if (!$hasPermission) {
            // หากไม่มีสิทธิ์ แสดง Error 403
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
        }

        return $next($request);
    }
}
