<?php

use App\Http\Controllers\Api\SendOtpController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/send-otp', [SendOtpController::class,'send'])->name('send.otp');
