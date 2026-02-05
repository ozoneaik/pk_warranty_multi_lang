<?php

use App\Http\Controllers\Api\SendOtpController;
use App\Http\Controllers\Warranty\WarrantyFormController;
use App\Models\MasterWaaranty\Banner;
use App\Models\MasterWaaranty\Popup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/popup/active', function () {
    $popups = Popup::where('is_active', true)
        ->orderBy('sort_order', 'asc')
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'images' => $popups->pluck('image_path')
    ]);
});

Route::get('banners/active', function () {
    $banners = Banner::where('is_active', true)->get();
    return response()->json([
        'background' => $banners->where('type', 'background')->sortByDesc('created_at')->first()?->image_path,
        'sliders' => $banners->where('type', 'slider')->sortBy('sort_order')->values()->pluck('image_path')
    ]);
});

// Route::post('/send-otp', [SendOtpController::class,'send'])->name('send.otp');