<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\CheckMenuPermission;
use App\Http\Middleware\PhoneAccess;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            // Route::middleware(['web', 'auth', 'admin']) // บังคับว่าต้อง Login และเป็น Admin
            //     ->prefix('admin')                       // URL จะขึ้นต้นด้วย /admin
            //     ->name('admin.')                        // ชื่อ Route จะขึ้นต้นด้วย admin.
            //     ->group(base_path('routes/admin.php')); // ชี้ไปที่ไฟล์ admin.php
            Route::middleware('web')
                ->prefix('admin')
                ->name('admin.')
                ->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'checkPhoneAccess' => PhoneAccess::class,
            'admin' => AdminMiddleware::class,
            'check_menu' => CheckMenuPermission::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            // ถ้า URL ขึ้นต้นด้วย admin/* ให้ไปหน้า login ของ admin
            if ($request->is('admin/*')) {
                return route('admin.login');
            }
            // ถ้าไม่ใช่ (User ปกติ) ให้ไปหน้า login ปกติ
            return route('login');
        });

        $middleware->redirectUsersTo(function (Request $request) {
            // เช็คว่าใครล็อกอินค้างอยู่
            if (Auth::guard('admin')->check()) {
                return route('admin.dashboard');
            }

            // ถ้าเป็น User ปกติ
            return route('dashboard');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
