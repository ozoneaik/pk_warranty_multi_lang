<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Admin\AdminPermissionController;
use App\Http\Controllers\Admin\AdminPointProcessController;
use App\Http\Controllers\Admin\AdminPrivilegeController;
use App\Http\Controllers\Admin\AdminCouponController;
use App\Http\Controllers\Admin\AdminFGFReportController;
use App\Http\Controllers\Admin\AdminOrderReportController;
use App\Http\Controllers\Admin\AdminCustomerReportController;
use App\Http\Controllers\Admin\AdminPopupController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AdminRewardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Models\AdminMenu;
use App\Models\RoleMenuPermission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest:admin')->group(function () {
    Route::get('login', [AdminAuthController::class, 'create'])->name('login');
    Route::post('login', [AdminAuthController::class, 'store'])->name('login.store');
});
Route::middleware('auth:admin')->group(function () {
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [AdminProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [AdminProfileController::class, 'update'])->name('update');
        Route::put('/password', [AdminProfileController::class, 'updatePassword'])->name('password.update');
    });
    Route::post('logout', [AdminAuthController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard', [
            'menus' => Auth::guard('admin')->user()->getAllowedMenus()
        ]);
    })->name('dashboard');

    Route::prefix('permissions')->name('permissions.')->middleware('check_menu:permissions')->group(function () {
        Route::get('/', [AdminPermissionController::class, 'index'])->name('index');
        Route::post('/update', [AdminPermissionController::class, 'update'])->name('update');
    });
    Route::get('users/{id}/permissions', [AdminPermissionController::class, 'userPermissions'])->name('users.permissions.edit');
    Route::post('users/{id}/permissions', [AdminPermissionController::class, 'updateUserPermissions'])->name('users.permissions.update');

    // Route::prefix('products')->name('products.')->middleware('check_menu:products')->group(function () {
    //     Route::get('/', [AdminProductController::class, 'index'])->name('index');
    //     Route::get('/create', [AdminProductController::class, 'create'])->name('create');
    //     Route::post('/', [AdminProductController::class, 'store'])->name('store');
    //     Route::get('/search-api', [AdminProductController::class, 'search'])->name('search.api');
    //     Route::get('/{id}/edit', [AdminProductController::class, 'edit'])->name('edit');
    //     Route::put('/{id}', [AdminProductController::class, 'update'])->name('update');
    //     Route::delete('/{id}', [AdminProductController::class, 'destroy'])->name('destroy');
    // });

    Route::prefix('rewards')->name('rewards.')->middleware('check_menu:rewards')->group(function () {
        Route::get('/', [AdminRewardController::class, 'index'])->name('index');
        Route::get('/create', [AdminRewardController::class, 'create'])->name('create');
        Route::post('/', [AdminRewardController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminRewardController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AdminRewardController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminRewardController::class, 'destroy'])->name('destroy');
        Route::get('/search-api', [AdminRewardController::class, 'search'])->name('search.api');
    });

    Route::prefix('privileges')->name('privileges.')->middleware('check_menu:privileges')->group(function () {
        Route::get('/', [AdminPrivilegeController::class, 'index'])->name('index');
        Route::get('/create', [AdminPrivilegeController::class, 'create'])->name('create');
        Route::post('/', [AdminPrivilegeController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminPrivilegeController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AdminPrivilegeController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminPrivilegeController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('coupons')->name('coupons.')->middleware('check_menu:coupons')->group(function () {
        Route::get('/', [AdminCouponController::class, 'index'])->name('index');
        Route::get('/create', [AdminCouponController::class, 'create'])->name('create');
        Route::post('/', [AdminCouponController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminCouponController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AdminCouponController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminCouponController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('points')->name('points.')->middleware('check_menu:points')->group(function () {
        Route::get('/', [AdminPointProcessController::class, 'index'])->name('index');
        Route::get('/create', [AdminPointProcessController::class, 'create'])->name('create');
        Route::post('/', [AdminPointProcessController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminPointProcessController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AdminPointProcessController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminPointProcessController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('users')->name('users.')->middleware('check_menu:users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->name('index');
        Route::get('/create', [AdminUserController::class, 'create'])->name('create');
        Route::post('/', [AdminUserController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminUserController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AdminUserController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminUserController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('popups')->name('popups.')->middleware('check_menu:popups')->group(function () {
        Route::get('/', [AdminPopupController::class, 'index'])->name('index');
        Route::post('/', [AdminPopupController::class, 'store'])->name('store');
        Route::put('/{id}', [AdminPopupController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminPopupController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('banners')->name('banners.')->middleware('check_menu:banners')->group(function () {
        Route::get('/', [AdminBannerController::class, 'index'])->name('index');
        Route::post('/', [AdminBannerController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminBannerController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AdminBannerController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminBannerController::class, 'destroy'])->name('destroy');
    });

    // Route::prefix('orders')->name('orders.')->middleware('check_menu:orders')->group(function () {
    //     Route::get('/orders', [AdminOrderReportController::class, 'index'])->name('orders.index');
    // });

    Route::prefix('reports')->name('reports.')->group(function () {
        // กลุ่ม Route สำหรับ Report หลัก
        Route::middleware('check_menu:reports')->group(function () {
            Route::get('/', function () {
                // [แก้ไข] เพิ่ม Logic การดึง Sub Menus จาก Database
                $parentMenu = AdminMenu::where('route_name', 'admin.reports.index') // ตรวจสอบชื่อ route ใน DB ว่าตรงกับ admin.reports.index หรือไม่
                    ->with(['children' => function ($q) {
                        $q->where('is_active', true)->orderBy('order');
                    }])
                    ->first();

                return Inertia::render('Admin/Reports/Index', [
                    // ส่งตัวแปร sub_menus ไปให้ React
                    'sub_menus' => $parentMenu?->children ?? []
                ]);
            })->name('index');
        });

        // กลุ่ม Route สำหรับ Report FGF
        Route::middleware('check_menu:reports.fgf')->group(function () {
            Route::get('/fgf', [AdminFGFReportController::class, 'index'])->name('fgf');
        });

        Route::middleware('check_menu:reports.orders')->group(function () {
            Route::get('/orders', [AdminOrderReportController::class, 'index'])->name('orders.index');
            Route::patch('/{id}/status', [AdminOrderReportController::class, 'updateStatus'])->name('orders.updateStatus');
            Route::post('/{id}/sync', [AdminOrderReportController::class, 'syncStatus'])->name('orders.sync');
        });

        Route::middleware('check_menu:reports.customers')->group(function () {
            Route::get('/customers', [AdminCustomerReportController::class, 'index'])->name('customers');
        });
    });

    Route::prefix('reward-management')
        ->name('reward-management.')
        ->middleware('check_menu:reward-management')
        ->group(function () {
            Route::get('/', function () {
                $parentMenu = AdminMenu::where(
                    'route_name',
                    'admin.reward-management.index'
                )
                    ->with(['children' => function ($q) {
                        $q->where('is_active', true)->orderBy('order');
                    }])
                    ->first();

                return Inertia::render('Admin/RewardManagement/Index', [
                    'sub_menus' => $parentMenu?->children ?? []
                ]);
            })->name('index');
        });
});
