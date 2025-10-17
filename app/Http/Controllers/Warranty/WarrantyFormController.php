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

    public function checkSn(Request $request)
    {
        $sn = $request->input('sn');
        $model_code = $request->input('model_code');
        $status = 400;
        $data_response = [];

        try {
            $check_form_history = TblHistoryProd::query()
                ->where('model_code', $model_code)
                ->where(function ($q) use ($sn) {
                    if ($sn) {
                        $q->orWhere('serial_number', $sn);
                    }
                })
                ->first();

            if ($check_form_history) {
                return response()->json([
                    'status' => 'duplicate',
                    'message' => 'หมายเลขสินค้านี้ถูกลงทะเบียนแล้ว',
                ], 200);
            }

            if ($model_code) {
                $response = Http::timeout(30)
                    ->withOptions(['verify' => false])
                    ->post(env('VITE_R_MAIN_PRODUCT'), [
                        'pid' => $model_code,
                        'views' => 'single'
                    ]);

                if ($response->successful()) {
                    $response_json = $response->json();

                    if ($response_json['status'] === 'SUCCESS' && !empty($response_json['assets'][0])) {
                        $asset = $response_json['assets'][0];
                        $data_response['product_detail'] = [
                            'pid' => $asset['pid'] ?? '',
                            'pname' => $asset['pname'] ?? '',
                            'fac_model' => $asset['facmodel'] ?? '',
                            'image' => $asset['imagesku'] ?? '',
                            'warrantyperiod' => $asset['warrantyperiod'] ?? '',
                            'warrantycondition' => $asset['warrantycondition'] ?? '',
                            'warrantynote' => $asset['warrantynote'] ?? '',
                            'sp_warranty' => $asset['sp_warranty'] ?? [],
                        ];

                        return response()->json([
                            'message' => "Model Code ถูกต้อง",
                            'data' => $data_response,
                        ], 200);
                    }
                }
            }

            if ($sn) {
                $response = Http::timeout(30)
                    ->withOptions(['verify' => false])
                    ->post(env('VITE_R_MAIN_SERIAL'), [
                        'sn' => $sn,
                        'view' => 'sigle'
                    ]);

                if ($response->successful()) {
                    $response_json = $response->json();

                    if ($response_json['status'] === 'SUCCESS' && ($response_json['warrantyexpire'] === false || $response_json['warrantyexpire'] === 'false')) {
                        $asset = $response_json['assets'][$response_json['skuset'][0]] ?? null;
                        if ($asset) {
                            $data_response['product_detail'] = [
                                'pid' => $asset['pid'] ?? '',
                                'pname' => $asset['pname'] ?? '',
                                'fac_model' => $asset['facmodel'] ?? '',
                                'image' => $asset['imagesku'] ?? '',
                                'warrantyperiod' => $asset['warrantyperiod'] ?? '',
                                'warrantycondition' => $asset['warrantycondition'] ?? '',
                                'warrantynote' => $asset['warrantynote'] ?? '',
                                'sp_warranty' => $asset['sp_warranty'] ?? [],
                            ];

                            return response()->json([
                                'message' => "Serial Number ถูกต้อง",
                                'data' => $data_response,
                            ], 200);
                        }
                    }
                }
            }

            // ❌ 4️⃣ ถ้าไม่เจอทั้ง SN และ Model
            throw new \Exception('ไม่พบข้อมูล Model Code หรือ Serial Number นี้ในระบบ');
        } catch (\Exception $e) {
            Log::error('❌ Warranty Check Error', [
                'sn' => $sn,
                'model_code' => $model_code,
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
