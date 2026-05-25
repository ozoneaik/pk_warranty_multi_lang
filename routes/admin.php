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
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminDealerController;
use App\Http\Controllers\Admin\AdminLoginLogController;
use App\Http\Controllers\Admin\AdminWarrantyDashboardController;
use App\Http\Controllers\Admin\AdminWarrantyRegistrationController;
use App\Http\Controllers\Admin\AdminMemberPointController;
use App\Http\Controllers\Admin\AdminPcRankingReportController;
use App\Http\Controllers\Admin\AdminPopupController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AdminRewardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Models\AdminMenu;
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

    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // ---------- Permissions ----------
    Route::prefix('permissions')->name('permissions.')->group(function () {
        Route::get('/', [AdminPermissionController::class, 'index'])->middleware('check_menu:permissions,read')->name('index');
        Route::post('/update', [AdminPermissionController::class, 'update'])->middleware('check_menu:permissions,update')->name('update');
    });

    // ---------- Rewards ----------
    Route::prefix('rewards')->name('rewards.')->group(function () {
        Route::get('/', [AdminRewardController::class, 'index'])->middleware('check_menu:rewards,read')->name('index');
        Route::get('/search-api', [AdminRewardController::class, 'search'])->middleware('check_menu:rewards,read')->name('search.api');
        Route::get('/create', [AdminRewardController::class, 'create'])->middleware('check_menu:rewards,create')->name('create');
        Route::post('/', [AdminRewardController::class, 'store'])->middleware('check_menu:rewards,create')->name('store');
        Route::get('/{id}/edit', [AdminRewardController::class, 'edit'])->middleware('check_menu:rewards,update')->name('edit');
        Route::put('/{id}', [AdminRewardController::class, 'update'])->middleware('check_menu:rewards,update')->name('update');
        Route::delete('/{id}', [AdminRewardController::class, 'destroy'])->middleware('check_menu:rewards,delete')->name('destroy');
    });

    // ---------- Privileges ----------
    Route::prefix('privileges')->name('privileges.')->group(function () {
        Route::get('/', [AdminPrivilegeController::class, 'index'])->middleware('check_menu:privileges,read')->name('index');
        Route::get('/create', [AdminPrivilegeController::class, 'create'])->middleware('check_menu:privileges,create')->name('create');
        Route::post('/', [AdminPrivilegeController::class, 'store'])->middleware('check_menu:privileges,create')->name('store');
        Route::get('/{id}/edit', [AdminPrivilegeController::class, 'edit'])->middleware('check_menu:privileges,update')->name('edit');
        Route::put('/{id}', [AdminPrivilegeController::class, 'update'])->middleware('check_menu:privileges,update')->name('update');
        Route::delete('/{id}', [AdminPrivilegeController::class, 'destroy'])->middleware('check_menu:privileges,delete')->name('destroy');
    });

    // ---------- Coupons ----------
    Route::prefix('coupons')->name('coupons.')->group(function () {
        Route::get('/', [AdminCouponController::class, 'index'])->middleware('check_menu:coupons,read')->name('index');
        Route::get('/create', [AdminCouponController::class, 'create'])->middleware('check_menu:coupons,create')->name('create');
        Route::post('/', [AdminCouponController::class, 'store'])->middleware('check_menu:coupons,create')->name('store');
        Route::get('/{id}/edit', [AdminCouponController::class, 'edit'])->middleware('check_menu:coupons,update')->name('edit');
        Route::put('/{id}', [AdminCouponController::class, 'update'])->middleware('check_menu:coupons,update')->name('update');
        Route::delete('/{id}', [AdminCouponController::class, 'destroy'])->middleware('check_menu:coupons,delete')->name('destroy');
    });

    // ---------- Points ----------
    Route::prefix('points')->name('points.')->group(function () {
        Route::get('/', [AdminPointProcessController::class, 'index'])->middleware('check_menu:points,read')->name('index');
        Route::get('/create', [AdminPointProcessController::class, 'create'])->middleware('check_menu:points,create')->name('create');
        Route::post('/', [AdminPointProcessController::class, 'store'])->middleware('check_menu:points,create')->name('store');
        Route::get('/{id}/edit', [AdminPointProcessController::class, 'edit'])->middleware('check_menu:points,update')->name('edit');
        Route::put('/{id}', [AdminPointProcessController::class, 'update'])->middleware('check_menu:points,update')->name('update');
        Route::delete('/{id}', [AdminPointProcessController::class, 'destroy'])->middleware('check_menu:points,delete')->name('destroy');
    });

    // ---------- Users ----------
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->middleware('check_menu:users,read')->name('index');
        Route::get('/create', [AdminUserController::class, 'create'])->middleware('check_menu:users,create')->name('create');
        Route::post('/', [AdminUserController::class, 'store'])->middleware('check_menu:users,create')->name('store');
        Route::get('/{id}/edit', [AdminUserController::class, 'edit'])->middleware('check_menu:users,update')->name('edit');
        Route::put('/{id}', [AdminUserController::class, 'update'])->middleware('check_menu:users,update')->name('update');
        Route::delete('/{id}', [AdminUserController::class, 'destroy'])->middleware('check_menu:users,delete')->name('destroy');
        Route::get('/{id}/permissions', [AdminPermissionController::class, 'userPermissions'])->middleware('check_menu:users,update')->name('permissions.edit');
        Route::post('/{id}/permissions', [AdminPermissionController::class, 'updateUserPermissions'])->middleware('check_menu:users,update')->name('permissions.update');
    });

    // ---------- Popups ----------
    Route::prefix('popups')->name('popups.')->group(function () {
        Route::get('/', [AdminPopupController::class, 'index'])->middleware('check_menu:popups,read')->name('index');
        Route::post('/', [AdminPopupController::class, 'store'])->middleware('check_menu:popups,create')->name('store');
        Route::put('/{id}', [AdminPopupController::class, 'update'])->middleware('check_menu:popups,update')->name('update');
        Route::delete('/{id}', [AdminPopupController::class, 'destroy'])->middleware('check_menu:popups,delete')->name('destroy');
    });

    // ---------- Banners ----------
    Route::prefix('banners')->name('banners.')->group(function () {
        Route::get('/', [AdminBannerController::class, 'index'])->middleware('check_menu:banners,read')->name('index');
        Route::get('/{id}/edit', [AdminBannerController::class, 'edit'])->middleware('check_menu:banners,update')->name('edit');
        Route::post('/', [AdminBannerController::class, 'store'])->middleware('check_menu:banners,create')->name('store');
        Route::put('/{id}', [AdminBannerController::class, 'update'])->middleware('check_menu:banners,update')->name('update');
        Route::delete('/{id}', [AdminBannerController::class, 'destroy'])->middleware('check_menu:banners,delete')->name('destroy');
    });

    // ---------- Member Points ----------
    Route::prefix('member-points')->name('member-points.')->group(function () {
        Route::get('/', [AdminMemberPointController::class, 'index'])->middleware('check_menu:member_points,read')->name('index');
        Route::post('/search', [AdminMemberPointController::class, 'searchCustomer'])->middleware('check_menu:member_points,read')->name('search');
        Route::post('/adjust', [AdminMemberPointController::class, 'adjustPoints'])->middleware('check_menu:member_points,update')->name('adjust');
    });

    // ---------- Reports ----------
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', function () {
            $parentMenu = AdminMenu::where('route_name', 'admin.reports.index')
                ->with(['children' => fn($q) => $q->where('is_active', true)->orderBy('order')])
                ->first();
            return Inertia::render('Admin/Reports/Index', [
                'sub_menus' => $parentMenu?->children ?? []
            ]);
        })->middleware('check_menu:reports,read')->name('index');

        Route::get('/fgf', [AdminFGFReportController::class, 'index'])->middleware('check_menu:reports.fgf,read')->name('fgf');

        Route::get('/orders', [AdminOrderReportController::class, 'index'])->middleware('check_menu:reports.orders,read')->name('orders.index');
        Route::patch('/{id}/status', [AdminOrderReportController::class, 'updateStatus'])->middleware('check_menu:reports.orders,update')->name('orders.updateStatus');
        Route::post('/{id}/sync', [AdminOrderReportController::class, 'syncStatus'])->middleware('check_menu:reports.orders,update')->name('orders.sync');

        Route::get('/customers', [AdminCustomerReportController::class, 'index'])->middleware('check_menu:reports.customers,read')->name('customers');
        Route::get('/customers/export', [AdminCustomerReportController::class, 'exportExcel'])->middleware('check_menu:reports.customers,read')->name('customers.export');

        Route::get('/pc-ranking', [AdminPcRankingReportController::class, 'index'])->middleware('check_menu:reports.pc-ranking,read')->name('pc-ranking');

        Route::get('/warranty-dashboard', [AdminWarrantyDashboardController::class, 'index'])->middleware('check_menu:reports.warranty-dashboard,read')->name('warranty-dashboard');
    });

    // ---------- Login Logs ----------
    Route::prefix('login-logs')->name('login-logs.')->group(function () {
        Route::get('/', [AdminLoginLogController::class, 'index'])->middleware('check_menu:login_logs,read')->name('index');
    });

    // ---------- Warranty Registrations ----------
    Route::prefix('warranty-registrations')->name('warranty-registrations.')->group(function () {
        Route::get('/', [AdminWarrantyRegistrationController::class, 'index'])->middleware('check_menu:warranty-registrations,read')->name('index');
        Route::get('/export', [AdminWarrantyRegistrationController::class, 'exportExcel'])->middleware('check_menu:warranty-registrations,read')->name('export');
    });

    // ---------- Reward Management ----------
    Route::prefix('reward-management')->name('reward-management.')->group(function () {
        Route::get('/', function () {
            $parentMenu = AdminMenu::where('route_name', 'admin.reward-management.index')
                ->with(['children' => fn($q) => $q->where('is_active', true)->orderBy('order')])
                ->first();
            return Inertia::render('Admin/RewardManagement/Index', [
                'sub_menus' => $parentMenu?->children ?? []
            ]);
        })->middleware('check_menu:reward-management,read')->name('index');
    });

    // ---------- Settings ----------
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/terms', [\App\Http\Controllers\Admin\AdminSettingController::class, 'editTerms'])->middleware('check_menu:settings,read')->name('terms.edit');
        Route::post('/terms', [\App\Http\Controllers\Admin\AdminSettingController::class, 'updateTerms'])->middleware('check_menu:settings,update')->name('terms.update');
    });

    // ---------- Dealers ----------
    Route::prefix('dealers')->name('dealers.')->group(function () {
        Route::get('/', [AdminDealerController::class, 'index'])->middleware('check_menu:dealers,read')->name('index');
        Route::post('/', [AdminDealerController::class, 'store'])->middleware('check_menu:dealers,create')->name('store');
        Route::put('/{id}', [AdminDealerController::class, 'update'])->middleware('check_menu:dealers,update')->name('update');
        Route::delete('/{id}', [AdminDealerController::class, 'destroy'])->middleware('check_menu:dealers,delete')->name('destroy');

        Route::prefix('channels')->name('channels.')->group(function () {
            Route::post('/', [AdminDealerController::class, 'storeChannel'])->middleware('check_menu:dealers,create')->name('store');
            Route::put('/{id}', [AdminDealerController::class, 'updateChannel'])->middleware('check_menu:dealers,update')->name('update');
            Route::delete('/{id}', [AdminDealerController::class, 'destroyChannel'])->middleware('check_menu:dealers,delete')->name('destroy');
        });
    });

    // ---------- Logs ----------
    Route::prefix('logs')->name('logs.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\AdminLogController::class, 'index'])->middleware('check_menu:logs,read')->name('index');
        Route::get('/download/{filename}', [App\Http\Controllers\Admin\AdminLogController::class, 'download'])->middleware('check_menu:logs,read')->name('download');
        Route::delete('/{filename}', [App\Http\Controllers\Admin\AdminLogController::class, 'destroy'])->middleware('check_menu:logs,delete')->name('destroy');
    });
});

