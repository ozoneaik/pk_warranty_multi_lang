<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblHistoryProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WarrantyFormController extends Controller
{
    public function form()
    {
        $uri = env('ROCKET_GET_CHANEL_BUY_URI');
        $response = Http::timeout(30)->withOptions(['verify' => false])->get($uri, [
            'name' => 'ช่องทางการซื้อ',
        ]);
        if ($response->successful() && $response->status() === 200) {
            $response_json = $response->json();
            $response_json = $response_json['data'];
        } else {
            $response_json = [];
        }
        return Inertia::render('Warranty/WarrantyForm', ['channel_list' => $response_json]);
    }

    public function get_store_name($store_name)
    {
        try {
            $merchant_id = env('MERCHANT_ID_ROCKET');
            $accessToken = env('ACCESS_TOKEN_ROCKET');
            $uri = env('ROCKET_GET_CHANEL_BUY_URI_DETAIL');

            $response = Http::timeout(30)->withOptions([
                'verify' => false, // ✅ ปิดตรวจสอบ SSL
            ])->withHeaders([
                'access-token' => $accessToken,
                'merchant-id'  => $merchant_id,
                'charset'      => 'utf-8',
                'Content-Type' => 'application/json',
            ])->get($uri, [
                'name' => $store_name,
            ]);

            if ($response->successful() && $response->status() === 200) {
                $response_json = $response->json();
                return response()->json([
                    'message' => 'ดึงรายการสำเร็จ',
                    'list' => $response_json
                ]);
            } else {
                throw new \Exception('ไม่สามารถดึงรายการช่องทางการซื้อได้ (HTTP ' . $response->status() . ')');
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'list' => []
            ], 400);
        }
    }

    public function store(Request $request) {}

    public function checkSn($sn)
    {
        $check_form_history = TblHistoryProd::query()->where('serial_number', $sn)
            ->select('serial_number')
            ->first();
        $status = 400;
        $data_response = [];
        try {
            if ($check_form_history) {
                throw new \Exception('หมายเลขนี้เคยลงทะเบียนแล้ว');
            } else {
                $response = Http::post(env('VITE_R_MAIN_SERIAL'), ['sn' => $sn, 'view' => 'sigle']);
                if ($response->successful() && $response->status() === 200) {
                    $response_json = $response->json();
                    if ($response_json['status'] === 'SUCCESS') {
                        $data_response = $response_json;
                        if ($response_json['warrantyexpire'] === false) {
                            return response()->json([
                                'message' => "ดึงข้อมูลหมายเลข S/N : $sn สำเร็จ",
                                'data' => $data_response
                            ]);
                        } else {
                            $status = 400;
                            throw new \Exception('หมายเลขซีเรียลนี้เคยลงทะเบียนรับประกันไปแล้ว');
                        }
                    } else {
                        $status = 400;
                        throw new \Exception('เกิดปัญหาในการค้นหาหมายเลขซีเรียลผ่าน api กรุณาลองอีกครั้ง STATUS IS NOT SUCCESS');
                    }
                } else {
                    $status = 400;
                    throw new \Exception('เกิดปัญหาในการค้นหาหมายเลขซีเรียลผ่าน api กรุณาลองอีกครั้ง');
                }
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'data' => $data_response ?? []
            ], $status ?? 400);
        }
    }
}
