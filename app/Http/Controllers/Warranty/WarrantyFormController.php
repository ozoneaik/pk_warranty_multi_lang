<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Http\Requests\Warranty\WrFormRequest;
use App\Models\MasterWaaranty\TblHistoryProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WarrantyFormController extends Controller
{

    // public function form()
    // {
    //     try {
    //         $uri = env('ROCKET_GET_CHANEL_BUY_URI');
    //         $response = Http::timeout(30)->withOptions(['verify' => false])->get($uri, [
    //             'name' => 'ช่องทางการซื้อ',
    //         ]);

    //         if ($response->successful() && $response->status() === 200) {
    //             $response_json = $response->json();
    //             $response_json = $response_json['data'];
    //         } else {
    //             $response_json = [];
    //         }
    //         return Inertia::render('Warranty/WarrantyForm', ['channel_list' => $response_json]);
    //     } catch (\Exception $e) {
    //         return Inertia::render('Warranty/WarrantyForm', ['channel_list' => []]);
    //     }
    // }

    public function form()
    {
        $channel_list = [];

        try {
            $uri = env('ROCKET_GET_CHANEL_BUY_URI');

            Log::info('🛰 [WarrantyFormController] เริ่มโหลด channel_list', ['uri' => $uri]);

            $response = Http::timeout(15)->withOptions(['verify' => false])->get($uri, [
                'name' => 'ช่องทางการซื้อ',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                Log::info('📬 [WarrantyFormController] ตอบกลับจาก Rocket', [
                    'status' => $response->status(),
                    'preview' => mb_substr(json_encode($data), 0, 200),
                ]);

                // ✅ ปลอดภัยขึ้น: ตรวจ key ให้แน่ชัด
                if (isset($data['data']) && is_array($data['data'])) {
                    $channel_list = $data['data'];
                } elseif (isset($data['list']) && is_array($data['list'])) {
                    $channel_list = $data['list'];
                } else {
                    Log::warning('⚠️ [WarrantyFormController] ไม่มี key data/list ใน response');
                    $channel_list = [];
                }
            } else {
                Log::error('❌ [WarrantyFormController] Rocket API ไม่สำเร็จ', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('💥 [WarrantyFormController] ดึงช่องทางการซื้อไม่สำเร็จ', [
                'message' => $e->getMessage(),
            ]);
        }

        return Inertia::render('Warranty/WarrantyForm', [
            'channel_list' => $channel_list,
        ]);
    }

    public function get_store_name($store_name)
    {
        try {
            $merchant_id = env('MERCHANT_ID_ROCKET');
            $accessToken = env('ACCESS_TOKEN_ROCKET');
            $uri = env('ROCKET_GET_CHANEL_BUY_URI_DETAIL');
            Log::info('🛰 [get_store_name] เริ่มดึงรายชื่อร้านค้า', [
                'store_name'   => $store_name,
                'uri'          => $uri,
                'merchant_id'  => $merchant_id,
            ]);
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

            Log::info('📡 [get_store_name] ตอบกลับจาก Rocket API', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body_preview' => mb_substr($response->body(), 0, 300) . '...',
            ]);


            if ($response->successful() && $response->status() === 200) {
                $response_json = $response->json();

                Log::info('✅ [get_store_name] เนื้อหาที่ได้จาก Rocket', [
                    'response_json' => $response_json,
                ]);

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

    //เช๊คซ้ำจาก Serial Number อย่างเดียว
    public function checkSn(Request $request)
    {
        $sn = $request->input('sn');
        $status = 400;
        $data_response = [];

        try {
            if (empty($sn)) {
                throw new \Exception('กรุณากรอกหมายเลขซีเรียล');
            }

            Log::info('🛰 [WarrantyFormController] เริ่มตรวจสอบหมายเลขซีเรียลจาก API', ['sn' => $sn]);

            // ตรวจจาก API ก่อน (VITE_R_MAIN_SERIAL)
            $response = Http::timeout(30)
                ->withOptions(['verify' => false])
                ->post(env('VITE_R_MAIN_SERIAL'), [
                    'sn' => $sn,
                    'view' => 'sigle',
                ]);

            if (!$response->successful()) {
                throw new \Exception('ไม่สามารถเชื่อมต่อ API ได้ (HTTP ' . $response->status() . ')');
            }

            $response_json = $response->json();

            Log::info('📡 [WarrantyFormController] ตอบกลับจาก API VITE_R_MAIN_SERIAL', [
                'status' => $response_json['status'] ?? null,
                'warrantyexpire' => $response_json['warrantyexpire'] ?? null,
                'skuset' => $response_json['skuset'] ?? [],
            ]);

            // ถ้า API ไม่ตอบ SUCCESS
            if (($response_json['status'] ?? '') !== 'SUCCESS') {
                throw new \Exception('ไม่พบหมายเลขซีเรียลนี้ในระบบ');
            }

            // ถ้าสินค้าหมดประกันแล้ว
            if ($response_json['warrantyexpire'] === true || $response_json['warrantyexpire'] === 'true') {
                throw new \Exception('หมายเลขซีเรียลนี้เคยลงทะเบียนรับประกันไปแล้ว');
            }

            // ถ้า SN ใช้งานได้ → ตรวจในฐานข้อมูลของเรา
            $check_form_history = TblHistoryProd::query()
                ->where('serial_number', $sn)
                ->select('serial_number', 'model_code', 'product_name', 'model_name')
                ->first();

            if ($check_form_history) {
                throw new \Exception('หมายเลขซีเรียลนี้ถูกลงทะเบียนในระบบแล้ว');
            }

            // ถ้า SN ใช้งานได้ → ดึงรายละเอียดสินค้าเพิ่มเติมจาก API VITE_R_MAIN_PRODUCT
            $assetKey = $response_json['skuset'][0] ?? null;
            $asset = $response_json['assets'][$assetKey] ?? null;

            if (!$asset) {
                throw new \Exception('ไม่พบข้อมูลสินค้าใน API Serial Response');
            }

            $model_code = $asset['pid'] ?? null;
            Log::info('🧩 [WarrantyFormController] เตรียมดึงข้อมูล Product Detail', ['model_code' => $model_code]);

            $productResponse = Http::timeout(30)
                ->withOptions(['verify' => false])
                ->post(env('VITE_R_MAIN_PRODUCT'), [
                    'pid' => $model_code,
                    'views' => 'single',
                ]);

            $productDetail = [];
            if ($productResponse->successful()) {
                $product_json = $productResponse->json();
                if (($product_json['status'] ?? '') === 'SUCCESS' && !empty($product_json['assets'][0])) {
                    $pd = $product_json['assets'][0];
                    $productDetail = [
                        'pid' => $pd['pid'] ?? '',
                        'pname' => $pd['pname'] ?? '',
                        'fac_model' => $pd['facmodel'] ?? '',
                        'image' => $pd['imagesku'] ?? '',
                        'warrantyperiod' => $pd['warrantyperiod'] ?? '',
                        'warrantycondition' => $pd['warrantycondition'] ?? '',
                        'warrantynote' => $pd['warrantynote'] ?? '',
                        'sp_warranty' => $pd['sp_warranty'] ?? [],
                    ];
                }
            }

            // รวมข้อมูลทั้งหมด (จาก Serial API + Product API)
            $data_response = [
                'serial_info' => $response_json,
                'product_detail' => $productDetail,
            ];

            return response()->json([
                'message' => "ดึงข้อมูลหมายเลข S/N: {$sn} สำเร็จ",
                'data' => $data_response
            ], 200);
        } catch (\Exception $e) {
            Log::error('❌ [WarrantyFormController] ตรวจสอบหมายเลขซีเรียลล้มเหลว', [
                'sn' => $sn,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => $e->getMessage(),
                'data' => $data_response ?? [],
            ], $status ?? 400);
        }
    }

    //ส่งข้อความหาลูกค้าหลังจากบันทึกลงทะเบียนรับประกัน
    public function store(WrFormRequest $request)
    {
        try {
            DB::beginTransaction();
            $req = $request->validated();

            $full_path = null;
            if ($request->hasFile('warranty_file')) {
                $file = $request->file('warranty_file');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = 'warranty_slips/' . $fileName;
                Storage::disk('s3')->put($path, file_get_contents($file), 'private');
                $full_path = Storage::disk('s3')->url($path);
            }

            $store = TblHistoryProd::create([
                'approval' => '',
                'lineid' => Auth::user()->line_id ?? Auth::user()->google_id ?? null,
                'cust_tel' => $req['phone'],
                'reward' => null,
                'serial_number' => $req['serial_number'],
                'model_code' => $req['model_code'],
                'model_name' => $req['model_name'],
                'product_name' => $req['product_name'],
                'buy_from' => $req['buy_from'],
                'store_name' => $req['store_name'],
                'buy_date' => $req['buy_date'],
                'slip' => $full_path,
                'approver' => null,
                'round' => null,
                'warranty_from' => 'pumpkin_multi_local',
                'customer_code' => $req['customer_code'] ?? null,
                'customer_name' => $req['customer_name'] ?? null,
            ]);

            DB::commit();

            try {
                $lineUid = $store->lineid;
                $token = env('LINE_CHANNEL_ACCESS_TOKEN');

                Log::info('🟢 LINE Push Attempt', [
                    'uid' => $lineUid,
                    'token_exists' => !empty($token),
                ]);

                if (!$lineUid) {
                    Log::warning('⚠️ ไม่มีค่า lineid ใน record', ['store_id' => $store->id]);
                    return redirect()->route('warranty.history');
                }

                if (empty($token)) {
                    Log::error('❌ ไม่พบ LINE_CHANNEL_ACCESS_TOKEN ใน .env');
                    return redirect()->route('warranty.history');
                }

                $baseDetail =
                    "📦 รายละเอียดการลงทะเบียน:\n" .
                    "• ชื่อสินค้า: " . ($store->product_name ?? '-') . "\n" .
                    "• รุ่น: " . ($store->model_name ?? '-') . "\n" .
                    "• Model Code: " . ($store->model_code ?? '-') . "\n" .
                    "• Serial Number: " . ($store->serial_number ?? '-') . "\n" .
                    "• ร้านที่ซื้อ: " . ($store->store_name ?? '-') . "\n" .
                    "• วันที่ซื้อ: " . ($store->buy_date ?? '-') . "\n";

                $message = [
                    'to' => $lineUid,
                    'messages' => [[
                        'type' => 'text',
                        'text' =>
                        "ขอบพระคุณสำหรับการลงทะเบียน 🙏\n" .
                            // $baseDetail .
                            "แอดมินกำลังตรวจสอบข้อมูลของท่าน ",
                    ]],
                ];

                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $token,
                ])->post('https://api.line.me/v2/bot/message/push', $message);

                Log::info('📬 LINE Push Response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                if ($response->failed()) {
                    Log::warning('⚠️ LINE Push Message Failed', [
                        'uid' => $lineUid,
                        'response' => $response->body(),
                    ]);
                }
            } catch (\Exception $ex) {
                Log::error('❌ LINE Push Error', [
                    'error' => $ex->getMessage(),
                    'lineid' => $store->lineid,
                ]);
            }

            return redirect()->route('warranty.history');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error in WarrantyFormController@store', [
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล: ' . $e->getMessage()]);
        }
    }
}
