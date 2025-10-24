<?php

use App\Http\Controllers\Api\SendOtpController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\Privilege\PrivilegeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Privilege\RedeemController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Warranty\WarrantyFormController;
use App\Http\Controllers\Warranty\WarrantyHistoryController;
use App\Http\Controllers\Warranty\WarrantyHomeController;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Route::has('login')) {
        return redirect()->intended(route('dashboard', absolute: false));
    } else {
        return redirect()->route('login');
    }
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/warranty/form/entry', function (Request $request) {
    if (!Auth::check()) {
        return redirect()->route('login', [
            'redirect' => route('warranty.form')
        ]);
    }
})->name('warranty.form.entry');

Route::get('/dashboard', function () {
    // return Inertia::render('Dashboard');
    return redirect()->route('warranty.home');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {


    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('customer-profile')->group(function () {
        Route::get('/', [CustomerProfileController::class, 'welcome'])->name('customer.profile.welcome');
        Route::get('/score', [CustomerProfileController::class, 'score'])->name('customer.profile.score');
        Route::get('/score/blank', function () {
            return Inertia::render('Profile/Customer/ScoreBlank');
        })->name('customer.profile.score.blank');

        Route::get('/edit', [CustomerProfileController::class, 'edit'])->name('customer.profile.edit');
        Route::patch('/', [CustomerProfileController::class, 'update'])->name('customer.profile.update');

        Route::get('/privilege/blank', function () {
            return Inertia::render('Profile/Customer/Blank/PrivilegeBlank');
        })->name('customer.profile.blank.privilege.blank');

        Route::get('/privilege', [PrivilegeController::class, 'index'])
            ->name('customer.profile.privilege');

        Route::get('/score/point', [ScoreController::class, 'getPoint']);
        Route::get('/info/pdpa', function () {
            $user = Auth::user();
            $customer = TblCustomerProd::where('cust_line', $user->line_id)
                ->orWhere('cust_tel', $user->phone)
                ->select('accept_policy', 'accept_pdpa')
                ->first();
            return Inertia::render('Profile/Customer/InfoPDPA', [
                'customer' => $customer,
            ]);
        })->name('customer.profile.info.pdpa');
        Route::post('/pdpa', [CustomerProfileController::class, 'updateConsent'])
            ->name('customer.profile.update.pdpa');
        Route::get('/info/term', function () {
            return Inertia::render('Profile/Customer/InfoTerm');
        })->name('customer.profile.info.term');
    });

    Route::post('/redeem', [RedeemController::class, 'store'])->name('redeem.store');
    Route::get('/redeem/history', [RedeemController::class, 'history'])->name('redeem.history');

    Route::get('/home', function () {})->name('home');


    Route::middleware('checkPhoneAccess')->group(function () {
        Route::prefix('warranty')->group(function () {
            // Route::get('/check-sn/{sn}', [WarrantyFormController::class, 'checkSn'])->name('warranty.check.sn');
            Route::post('/check-sn', [WarrantyFormController::class, 'checkSn'])->name('warranty.check.sn');
            Route::get('/home', [WarrantyHomeController::class, 'index'])->name('warranty.home');
            Route::get('/form', [WarrantyFormController::class, 'form'])->name('warranty.form');
            Route::post('/form', [WarrantyFormController::class, 'store'])->name('warranty.form.store');
            Route::get('/store_name/{store_name}', [WarrantyFormController::class, 'get_store_name'])->name('warranty.get_store_name');
            Route::get('/history', [WarrantyHistoryController::class, 'history'])->name('warranty.history');
            Route::get('/history/detail/{model_code}', [WarrantyHistoryController::class, 'historyDetail'])->name('warranty.history.detail');
            Route::post('/', function () {});
        });
    });

    Route::prefix('add-phone')->group(function () {
        Route::get('/', function () {
            return Inertia::render('AddPhone');
        })->name('add.phone');
        Route::post('/', [UserController::class, 'updatePhone'])->name('add.phone.store');
    });

    Route::post('/api/verify-otp', [SendOtpController::class, 'verify'])->name('verify.otp');
    Route::post('/api/send-otp', [SendOtpController::class, 'send'])->name('send.otp');
});

require __DIR__ . '/auth.php';
