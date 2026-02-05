<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ตรวจสอบว่า Login หรือยัง และ Role อยู่ในกลุ่ม Admin หรือไม่
        $allowedRoles = ['super_admin', 'admin', 'staff'];

        if (Auth::check() && in_array(Auth::user()->role, $allowedRoles)) {
            return $next($request);
        }

        abort(403, 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
    }
}
