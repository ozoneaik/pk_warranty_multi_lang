<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Http\Requests\Warranty\WrFormRequest;
use App\Models\MasterWaaranty\TblHistoryProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WarrantyFormController extends Controller
{
    public function form()
    {
        try {
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
        } catch (\Exception $e) {
            return Inertia::render('Warranty/WarrantyForm', ['channel_list' => []]);
        }
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

    public function store(WrFormRequest $request)
    {
        try {
            DB::beginTransaction();
            $req = $request->validated();
            $store = TblHistoryProd::updateOrCreate([
                'serial_number' => $req['serial_number'],
            ], [
                'approval' => '',
                'lineid' => Auth::user()->google_id ?? Auth::user()->line_id ?? null,
                'cust_tel' => $req['phone'],
                'reward' => null,
                'serial_number'  => $req['serial_number'],
                'model_code' => $req['model_code'],
                'model_name' => $req['model_name'],
                'product_name' => $req['product_name'],
                'buy_from' => $req['buy_from'],
                'store_name' => $req['store_name'],
                'buy_date' => $req['buy_date'],
                'slip' => 'hello', // path ที่เก็บไฟล์
                'approver' => null,
                'round' => null,
                'warranty_from'  => 'pumpkin_multi_local',
                'customer_code'  => $req['customer_code'] ?? null,
                'customer_name'  => $req['customer_name'] ?? null,
            ]);

            if ($request->hasFile('warranty_file')) {
                $file = $request->file('warranty_file');

                // ✅ ตั้งชื่อไฟล์ใหม่ (timestamp + uniqid + นามสกุลเดิม)
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                // ✅ path ใน S3
                $path = 'warranty_slips/' . $fileName;

                // ✅ อัพโหลดขึ้น S3 (เก็บเป็น private)
                Storage::disk('s3')->put($path, file_get_contents($file), 'private');

                // ✅ เก็บ path ไว้ใน database (ถ้าต้องการ public link ใช้ temporaryUrl ตอนแสดงผล)
                $slipPath = $path;
                $full_path = Storage::disk('s3')->url($slipPath);
            }

            //upload file to s3
            $store = TblHistoryProd::updateOrCreate([
                'serial_number' => $req['serial_number'],
            ], [
                'slip' => $full_path, // path ที่เก็บไฟล์
            ]);
            DB::beginTransaction();
            return redirect()->route('warranty.history');
        } catch (\Exception $e) {
            DB::rollBack();
            dd($e->getMessage());
        }
    }
}
