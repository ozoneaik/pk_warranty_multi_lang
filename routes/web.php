<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Warranty\WarrantyFormController;
use App\Http\Controllers\Warranty\WarrantyHistoryController;
use App\Http\Controllers\Warranty\WarrantyHomeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

Route::get('/dashboard', function () {
    // return Inertia::render('Dashboard');
    return redirect()->route('warranty.home');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/home', function(){
        
    })->name('home');

    Route::prefix('warranty')->group(function () {
        Route::get('/home', [WarrantyHomeController::class,'index'])->name('warranty.home');
        Route::get('/form', [WarrantyFormController::class,'form'])->name('warranty.form');
        Route::get('/history', [WarrantyHistoryController::class,'history'])->name('warranty.history');
        Route::post('/', function () {});
    });
});

require __DIR__ . '/auth.php';
