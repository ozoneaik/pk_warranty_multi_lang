<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Http\Requests\Warranty\WrFormRequest;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TblHistoryProd;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WarrantyFormController extends Controller
{
    //อันใหม่
    // public function form()
    // {
    //     $channel_list = [];

    //     try {
    //         $uri = env('ROCKET_GET_CHANEL_BUY_URI');

    //         Log::info('🛰 [WarrantyFormController] เริ่มโหลด channel_list', ['uri' => $uri]);

    //         $response = Http::timeout(15)->withOptions(['verify' => false])->get($uri, [
    //             'name' => 'ช่องทางการซื้อ',
    //         ]);

    //         if ($response->successful()) {
    //             $data = $response->json();

    //             Log::info('📬 [WarrantyFormController] ตอบกลับจาก Rocket', [
    //                 'status' => $response->status(),
    //                 'preview' => mb_substr(json_encode($data), 0, 200),
    //             ]);

    //             // ✅ ปลอดภัยขึ้น: ตรวจ key ให้แน่ชัด
    //             if (isset($data['data']) && is_array($data['data'])) {
    //                 $channel_list = $data['data'];
    //             } elseif (isset($data['list']) && is_array($data['list'])) {
    //                 $channel_list = $data['list'];
    //             } else {
    //                 Log::warning('⚠️ [WarrantyFormController] ไม่มี key data/list ใน response');
    //                 $channel_list = [];
    //             }
    //         } else {
    //             Log::error('❌ [WarrantyFormController] Rocket API ไม่สำเร็จ', [
    //                 'status' => $response->status(),
    //                 'body' => $response->body(),
    //             ]);
    //         }
    //     } catch (\Throwable $e) {
    //         Log::error('💥 [WarrantyFormController] ดึงช่องทางการซื้อไม่สำเร็จ', [
    //             'message' => $e->getMessage(),
    //         ]);
    //     }

    //     return Inertia::render('Warranty/WarrantyForm', [
    //         'channel_list' => $channel_list,
    //     ]);
    // }

    public function form()
    {
        $channel_list = [];
        $user = Auth::user();

        // เช็คว่าลูกค้าเคยมีเบอร์ไหม
        $customer = TblCustomerProd::query()
            ->where('cust_line', $user->line_id)
            ->orWhere('cust_tel', $user->phone)
            ->first();

        $has_phone = $customer && !empty($customer->cust_tel);
        $current_phone = $customer->cust_tel ?? $user->phone ?? '';

        try {
            $uri = env('ROCKET_GET_CHANEL_BUY_URI');
            // if (!$uri) dd("ไม่พบ ENV: ROCKET_GET_CHANEL_BUY_URI");
            $response = Http::timeout(15)->withOptions(['verify' => false])->get($uri, ['name' => 'ช่องทางการซื้อ']);

            if ($response->successful()) {
                $data = $response->json();
                // dd($data);
                // $channel_list = $data['data'] ?? $data['list'] ?? [];
                $channel_list = $data;
            }
        } catch (\Throwable $e) {
            Log::error('Load channel list failed', ['error' => $e->getMessage()]);
        }
        return Inertia::render('Warranty/WarrantyForm', [
            'channel_list'   => $channel_list,
            'has_phone'      => $has_phone,
            'current_phone'  => $current_phone,
        ]);
    }

    // public function get_store_name($store_name)
    // {
    //     try {
    //         $merchant_id = env('MERCHANT_ID_ROCKET');
    //         $accessToken = env('ACCESS_TOKEN_ROCKET');
    //         // $uri = env('ROCKET_GET_CHANEL_BUY_URI_DETAIL');
    //         $uri = 'https://uat-api.rocket-tech.app/api/rewarding/assets/pumpkin/store';

    //         Log::info('🛰 [get_store_name] เริ่มดึงรายชื่อร้านค้า', [
    //             'store_name'   => $store_name,
    //             'uri'          => $uri,
    //             'merchant_id'  => $merchant_id,
    //         ]);
    //         $response = Http::timeout(30)->withOptions([
    //             'verify' => false, // ✅ ปิดตรวจสอบ SSL
    //         ])->withHeaders([
    //             'access-token' => $accessToken,
    //             'merchant-id'  => $merchant_id,
    //             'charset'      => 'utf-8',
    //             'Content-Type' => 'application/json',
    //         ])->get($uri, [
    //             'name' => $store_name,
    //         ]);

    //         Log::info('📡 [get_store_name] ตอบกลับจาก Rocket API', [
    //             'status' => $response->status(),
    //             'successful' => $response->successful(),
    //             'body_preview' => mb_substr($response->body(), 0, 300) . '...',
    //         ]);


    //         if ($response->successful() && $response->status() === 200) {
    //             $response_json = $response->json();

    //             Log::info('✅ [get_store_name] เนื้อหาที่ได้จาก Rocket', [
    //                 'response_json' => $response_json,
    //             ]);

    //             return response()->json([
    //                 'message' => 'ดึงรายการสำเร็จ',
    //                 'list' => $response_json
    //             ]);
    //         } else {
    //             throw new \Exception('ไม่สามารถดึงรายการช่องทางการซื้อได้ (HTTP ' . $response->status() . ')');
    //         }
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => $e->getMessage(),
    //             'list' => []
    //         ], 400);
    //     }
    // }

    public function get_store_name($id)
    {
        try {
            // เส้น API ใหม่ที่ต้องการใช้
            $uri = "https://pk-api.pumpkin-th.com/api/get-store-name/{$id}";

            Log::info('🛰 [get_store_name] เริ่มดึงรายชื่อร้านค้าจาก Pumpkin API', [
                'id'  => $id,
                'uri' => $uri,
            ]);

            // ยิง Request (ปกติโดเมนนี้ไม่ต้องใช้ Header พิเศษแบบ Rocket)
            $response = Http::timeout(30)->withOptions([
                'verify' => false, // ✅ ปิดตรวจสอบ SSL (ถ้าจำเป็น)
            ])->get($uri);

            Log::info('📡 [get_store_name] ตอบกลับจาก API', [
                'status' => $response->status(),
                'successful' => $response->successful(),
            ]);

            if ($response->successful()) {
                $response_json = $response->json();

                return response()->json([
                    'message' => 'ดึงรายการสำเร็จ',
                    'list' => $response_json // ส่ง array กลับไปให้ frontend
                ]);
            } else {
                throw new \Exception('ไม่สามารถดึงข้อมูลร้านค้าได้ (HTTP ' . $response->status() . ')');
            }
        } catch (\Exception $e) {
            Log::error('❌ [get_store_name] Error', ['message' => $e->getMessage()]);

            return response()->json([
                'message' => $e->getMessage(),
                'list' => []
            ], 400);
        }
    }

    public function checkSn(Request $request)
    {
        $sn = $request->input('sn');
        $status = 400;
        $data_response = [];

        try {
            if (empty($sn)) {
                throw new \Exception('กรุณากรอกหมายเลขซีเรียล');
            }

            $check_form_history = TblHistoryProd::query()
                ->where('serial_number', $sn)
                ->select('serial_number', 'model_code', 'product_name', 'model_name')
                ->first();

            if ($check_form_history) {
                throw new \Exception('หมายเลขซีเรียลนี้ถูกลงทะเบียนในระบบแล้ว');
            }

            Log::info('🛰 [WarrantyFormController] เริ่มตรวจสอบ SN จาก API ใหม่', ['sn' => $sn]);

            $apiUrl = 'https://warranty-sn.pumpkin.tools/api/getdata';

            $response = Http::timeout(30)
                ->withOptions(['verify' => false])
                ->get($apiUrl, [
                    'search' => $sn
                ]);

            if (!$response->successful()) {
                throw new \Exception('ไม่สามารถเชื่อมต่อ API ตรวจสอบสินค้าได้ (HTTP ' . $response->status() . ')');
            }

            $apiData = $response->json();

            Log::info('📡 [WarrantyFormController] ผลลัพธ์จาก API', [
                'status' => $apiData['status'] ?? 'N/A',
                'is_combo' => $apiData['is_combo'] ?? false,
                'skuset' => $apiData['skuset'] ?? []
            ]);

            if (($apiData['status'] ?? '') !== 'SUCCESS') {
                throw new \Exception('ไม่พบข้อมูลหมายเลขซีเรียลนี้ในระบบ');
            }

            $isExpired = $apiData['warrantyexpire'] ?? false;
            if ($isExpired === true || $isExpired === 'true') {
                throw new \Exception('หมายเลขซีเรียลนี้หมดอายุรับประกัน หรือถูกใช้งานไปแล้ว');
            }

            $assets = $apiData['assets'] ?? [];
            if (empty($assets)) {
                throw new \Exception('พบ Serial Number แต่ไม่พบข้อมูลสินค้า (Assets Empty)');
            }

            $targetSku = $apiData['skumain'] ?? null;

            if (!$targetSku && !empty($apiData['skuset'])) {
                $targetSku = $apiData['skuset'][0];
            }

            // ดึง Object สินค้าออกมา
            $productData = null;
            if ($targetSku && isset($assets[$targetSku])) {
                $productData = $assets[$targetSku];
            } else {
                // กรณีหา key ไม่เจอ ให้หยิบตัวแรกสุดใน assets มาใช้เลย
                $productData = reset($assets);
            }

            if (!$productData) {
                throw new \Exception('ไม่สามารถดึงรายละเอียดสินค้าได้');
            }

            $imageUrl = '';
            if (!empty($productData['imagesku']) && is_array($productData['imagesku'])) {
                $imageUrl = $productData['imagesku'][0] ?? '';
            } elseif (!empty($productData['imagesku']) && is_string($productData['imagesku'])) {
                $imageUrl = $productData['imagesku'];
            }

            $mappedProductDetail = [
                'pid'               => $productData['pid'] ?? '',          // รหัสสินค้า (เช่น TX-8241)
                'pname'             => $productData['pname'] ?? '',        // ชื่อสินค้า
                'fac_model'         => $productData['facmodel'] ?? '',     // รุ่น
                'image'             => $imageUrl,                          // URL รูปภาพ
                'warrantyperiod'    => $productData['warrantyperiod'] ?? '',
                'warrantycondition' => $productData['warrantycondition'] ?? '',
                'warrantynote'      => $productData['warrantynote'] ?? '',

                'is_combo'          => $apiData['is_combo'] ?? false,
                'skumain'           => $apiData['skumain'] ?? '',
                'combo_skus'        => $apiData['skuset'] ?? [],
            ];

            $data_response = [
                'serial_info'    => ['status' => 'SUCCESS', 'sn' => $sn],
                'product_detail' => $mappedProductDetail,
            ];

            return response()->json([
                'message' => "ตรวจสอบข้อมูลสำเร็จ",
                'data'    => $data_response
            ], 200);
        } catch (\Exception $e) {
            Log::error('❌ [WarrantyFormController] Check SN Error', [
                'sn'    => $sn,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => $e->getMessage(),
                'data'    => []
            ], 400);
        }
    }

    //ส่งข้อความหาลูกค้าหลังจากบันทึกลงทะเบียนรับประกัน
    // public function store(WrFormRequest $request)
    // {
    //     try {
    //         DB::beginTransaction();
    //         $user = Auth::user();
    //         $req = $request->validated();

    //         $full_path = null;
    //         if ($request->hasFile('warranty_file')) {
    //             $file = $request->file('warranty_file');
    //             $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    //             $path = 'warranty_slips/' . $fileName;
    //             Storage::disk('s3')->put($path, file_get_contents($file), 'private');
    //             $full_path = Storage::disk('s3')->url($path);
    //         }

    //         // $phoneToSave = $req['phone'] ?: $user->phone ?: $customer->cust_tel ?? null;
    //         $store = TblHistoryProd::create([
    //             'approval' => '',
    //             'lineid' => Auth::user()->line_id ?? Auth::user()->google_id ?? null,
    //             'cust_tel' => $req['phone'] ?? $user->phone ?? null,
    //             'reward' => null,
    //             'serial_number' => $req['serial_number'],
    //             'model_code' => $req['model_code'],
    //             'model_name' => $req['model_name'],
    //             'product_name' => $req['product_name'],
    //             'buy_from' => $req['buy_from'],
    //             'store_name' => $req['store_name'],
    //             'buy_date' => $req['buy_date'],
    //             'slip' => $full_path,
    //             'approver' => null,
    //             'round' => null,
    //             'warranty_from' => 'pumpkin_multi_local',
    //             'customer_code' => $req['customer_code'] ?? null,
    //             'customer_name' => $req['customer_name'] ?? null,
    //         ]);

    //         $phone = $req['phone'] ?? $user->phone ?? null;
    //         $exists = TblCustomerProd::where('cust_tel', $phone)->first();

    //         if (!$exists) {
    //             do {
    //                 $unlockkey = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    //             } while (TblCustomerProd::where('unlockkey', $unlockkey)->exists());

    //             TblCustomerProd::create([
    //                 'cust_tel'          => $phone,
    //                 'cust_prefix'       => 'mr',
    //                 'cust_firstname'    => 'ไม่ระบุ',
    //                 'cust_lastname'     => 'ไม่ระบุ',
    //                 'cust_full_address' => 'ไม่ระบุ',
    //                 'cust_address'      => 'ไม่ระบุ',
    //                 'cust_subdistrict'  => 'ไม่ระบุ',
    //                 'cust_district'     => 'ไม่ระบุ',
    //                 'cust_province'     => 'ไม่ระบุ',
    //                 'cust_zipcode'      => '00000',
    //                 'cust_line'         => $user->line_id,
    //                 'cust_uid'          => $user->line_id,
    //                 'accept_news'       => 'N',
    //                 'accept_policy'     => 'Y',
    //                 'accept_pdpa'       => 'Y',
    //                 'accepted_pdpa_at'  => now(),
    //                 'unlockkey'         => $unlockkey,
    //                 'datetime'          => now(),
    //             ]);
    //         }

    //         DB::commit();

    //         try {
    //             $lineUid = $store->lineid;
    //             $token = env('LINE_CHANNEL_ACCESS_TOKEN');

    //             Log::info('🟢 LINE Push Attempt', [
    //                 'uid' => $lineUid,
    //                 'token_exists' => !empty($token),
    //             ]);

    //             if (!$lineUid) {
    //                 Log::warning('⚠️ ไม่มีค่า lineid ใน record', ['store_id' => $store->id]);
    //                 return redirect()->route('warranty.history');
    //             }

    //             if (empty($token)) {
    //                 Log::error('❌ ไม่พบ LINE_CHANNEL_ACCESS_TOKEN ใน .env');
    //                 return redirect()->route('warranty.history');
    //             }

    //             $baseDetail =
    //                 "📦 รายละเอียดการลงทะเบียน:\n" .
    //                 "• ชื่อสินค้า: " . ($store->product_name ?? '-') . "\n" .
    //                 "• รุ่น: " . ($store->model_name ?? '-') . "\n" .
    //                 "• Model Code: " . ($store->model_code ?? '-') . "\n" .
    //                 "• Serial Number: " . ($store->serial_number ?? '-') . "\n" .
    //                 "• ร้านที่ซื้อ: " . ($store->store_name ?? '-') . "\n" .
    //                 "• วันที่ซื้อ: " . ($store->buy_date ?? '-') . "\n";

    //             $message = [
    //                 'to' => $lineUid,
    //                 'messages' => [[
    //                     'type' => 'text',
    //                     'text' =>
    //                     "ขอบพระคุณสำหรับการลงทะเบียน 🙏\n" .
    //                         // $baseDetail .
    //                         "แอดมินกำลังตรวจสอบข้อมูลของท่าน ",
    //                 ]],
    //             ];

    //             $response = Http::withHeaders([
    //                 'Content-Type' => 'application/json',
    //                 'Authorization' => 'Bearer ' . $token,
    //             ])->post('https://api.line.me/v2/bot/message/push', $message);

    //             Log::info('📬 LINE Push Response', [
    //                 'status' => $response->status(),
    //                 'body' => $response->body(),
    //             ]);

    //             if ($response->failed()) {
    //                 Log::warning('⚠️ LINE Push Message Failed', [
    //                     'uid' => $lineUid,
    //                     'response' => $response->body(),
    //                 ]);
    //             }
    //         } catch (\Exception $ex) {
    //             Log::error('❌ LINE Push Error', [
    //                 'error' => $ex->getMessage(),
    //                 'lineid' => $store->lineid,
    //             ]);
    //         }

    //         return redirect()->route('warranty.history');
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         Log::error('❌ Error in WarrantyFormController@store', [
    //             'error' => $e->getMessage(),
    //         ]);
    //         return back()->withErrors(['error' => 'เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล: ' . $e->getMessage()]);
    //     }
    // }

    public function store(WrFormRequest $request)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();
            $req = $request->validated();

            // เลือกเบอร์โทรตามลำดับ
            $phone = $req['phone'] ?? $user->phone ?? null;

            if (!$phone) {
                return back()->withErrors(['phone' => 'กรุณากรอกเบอร์โทรศัพท์'])->withInput();
            }

            // อัปโหลดไฟล์ใบเสร็จ
            $full_path = null;
            if ($request->hasFile('warranty_file')) {
                $file = $request->file('warranty_file');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = 'warranty_slips/' . $fileName;
                Storage::disk('s3')->put($path, file_get_contents($file), 'private');
                $full_path = Storage::disk('s3')->url($path);
            }

            // หา customer ถ้ามีแล้วใช้เลย
            $customer = TblCustomerProd::where('cust_line', $user->line_id)
                ->orWhere('cust_tel', $phone)
                ->first();

            if (!$customer) {
                // gen unlockkey ไม่ซ้ำ
                do {
                    $unlockkey = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                } while (TblCustomerProd::where('unlockkey', $unlockkey)->exists());

                // สร้าง customer ใหม่
                $customer = TblCustomerProd::create([
                    'cust_tel'          => $phone,
                    'cust_prefix'       => 'mr',
                    'cust_firstname'    => 'ไม่ระบุ',
                    'cust_lastname'     => 'ไม่ระบุ',
                    'cust_full_address' => 'ไม่ระบุ',
                    'cust_address'      => 'ไม่ระบุ',
                    'cust_subdistrict'  => 'ไม่ระบุ',
                    'cust_district'     => 'ไม่ระบุ',
                    'cust_province'     => 'ไม่ระบุ',
                    'cust_zipcode'      => '00000',
                    'cust_line'         => $user->line_id,
                    'cust_uid'          => $user->line_id,
                    'accept_news'       => 'N',
                    'accept_policy'     => 'Y',
                    'accept_pdpa'       => 'Y',
                    'accepted_pdpa_at'  => now(),
                    'unlockkey'         => $unlockkey,
                    'datetime'          => now(),
                ]);
            } else {
                // ถ้ามี customer แต่ไม่มีเบอร์ → อัปเดตเบอร์
                if (empty($customer->cust_tel)) {
                    $customer->update(['cust_tel' => $phone]);
                }
            }

            // อัปเดตเบอร์ลง users ถ้ายังไม่มี
            if (empty($user->phone)) {
                $user->update(['phone' => $phone]);
            }

            // บันทึกประวัติการลงทะเบียน
            $store = TblHistoryProd::create([
                'approval' => '',
                'lineid' => $user->line_id ?? null,
                'cust_tel' => $phone,
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

            try {
                $rocketUrl = env('ROCKET_URL_API');
                $merchantId = env('MERCHANT_ID_ROCKET_NEW');
                $apiKey = env('API_KEY_ROCKET_NEW');
                $productImage = env('VITE_PRODUCT_IMAGE_URI');
                $userId = $user->id;
                $sellerId = 'SELLER-' . ($user->id ?? 0);

                $payload = [
                    'merchant_id' => $merchantId,
                    'user_id' => (string)$userId,
                    'user_phone_number' => '+66' . ltrim($phone, '0'),
                    'warranty_id' => 'WARRANTY-' . $store->id,
                    'product_name' => $store->product_name,
                    'product_code' => $store->model_code,
                    'product_model' => $store->model_name,
                    'product_image' => $productImage . '/' . $store->model_code . '.jpg',
                    'warranty_image' => $full_path,
                    'serial_number' => $store->serial_number,
                    'channel' => $store->buy_from,
                    'store' => $store->store_name,
                    'seller_id' => $sellerId,
                    'condition' => [],
                    'remark' => [],
                    'expire_warranty_date' => now()->addYears(2)->toIso8601String(),
                    'purchase_date' => $store->buy_date
                        ? Carbon::parse($store->buy_date)->toIso8601String()
                        : now()->toIso8601String(),
                ];

                // ดึงข้อมูล condition / remark จาก request
                if (!empty($req['warrantycondition'])) {
                    $payload['condition'] = preg_split('/[\n\r]+/', trim($req['warrantycondition']));
                }
                if (!empty($req['warrantynote'])) {
                    $payload['remark'] = preg_split('/[\n\r]+/', trim($req['warrantynote']));
                }

                // ถ้าไม่มีข้อมูล warrantycondition/warrantynote ใน request → ดึงจาก API
                if (empty($req['warrantycondition']) || empty($req['warrantynote'])) {
                    try {
                        $response = Http::timeout(10)
                            ->withOptions(['verify' => false])
                            ->post(env('VITE_R_MAIN_PRODUCT'), [
                                'pid' => $store->model_code,
                                'views' => 'single',
                            ]);

                        if ($response->successful()) {
                            $raw = $response->body();
                            $clean = preg_replace('/<br\s*\/?>\s*<b>.*?<\/b>.*?<br\s*\/?>/s', '', $raw);
                            $clean = preg_replace('/^.*?(\{.*\})$/s', '$1', $clean);
                            $json = json_decode($clean, true);

                            if (($json['status'] ?? '') === 'SUCCESS') {
                                $assets = $json['assets'] ?? [];
                                $skuset = $json['skuset'] ?? [];

                                $asset = null;
                                if (is_array($assets) && array_is_list($assets)) {
                                    $asset = $assets[0] ?? null;
                                } elseif (is_array($assets)) {
                                    if (is_array($skuset) && !empty($skuset)) {
                                        $firstKey = $skuset[0];
                                        if (isset($assets[$firstKey])) {
                                            $asset = $assets[$firstKey];
                                        }
                                    }
                                    if ($asset === null && !empty($assets)) {
                                        $asset = reset($assets);
                                    }
                                }

                                if ($asset) {
                                    if (empty($req['warrantycondition']) && !empty($asset['warrantycondition'])) {
                                        $payload['condition'] = preg_split('/[\n\r]+/', trim($asset['warrantycondition']));
                                    }

                                    if (empty($req['warrantynote']) && !empty($asset['warrantynote'])) {
                                        $payload['remark'] = preg_split('/[\n\r]+/', trim($asset['warrantynote']));
                                    }

                                    Log::info('[WarrantyFormController] เติมข้อมูล condition/remark จาก API สำเร็จ', [
                                        'model_code' => $store->model_code,
                                        'cond_count' => count($payload['condition']),
                                        'remark_count' => count($payload['remark']),
                                    ]);
                                }
                            }
                        }
                    } catch (\Throwable $e) {
                        Log::warning('[WarrantyFormController] ดึง condition/remark จาก API ล้มเหลว', [
                            'model_code' => $store->model_code,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                $rocketResponse = Http::timeout(20)
                    ->withOptions(['verify' => false])
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'rocket-merchant-id' => $merchantId,
                        'X-API-KEY' => $apiKey,
                    ])
                    ->post($rocketUrl, $payload);

                Log::info(
                    "🚀 [Warranty Sync] ส่งข้อมูลลงทะเบียนไป Rocket API:\n" .
                        "URL: {$rocketUrl}\n" .
                        "STATUS: {$rocketResponse->status()}\n" .
                        "SUCCESS: " . ($rocketResponse->successful() ? '✅ TRUE' : '❌ FALSE') . "\n" .
                        "PAYLOAD:\n" . json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n" .
                        "RESPONSE:\n" . json_encode(json_decode($rocketResponse->body(), true), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
                );
            } catch (\Exception $e) {
                Log::error('❌ [Warranty Sync] ส่งข้อมูลไป Rocket API ไม่สำเร็จ', [
                    'error' => $e->getMessage(),
                ]);
            }

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
            Log::error('❌ Error in WarrantyFormController@store', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
        }
    }
}
