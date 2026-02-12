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

            if (($apiData['search_type'] ?? '') !== 'serial') {
                throw new \Exception('กรุณาระบุเป็นหมายเลขเครื่อง (Serial Number) เท่านั้น');
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

            // 1. ดึงข้อมูล Main Assets (ถ้ามี)
            $mainAssetData = $apiData['main_assets'] ?? [];

            // 2. กำหนด PID (รหัสสินค้า)
            // ถ้ามีใน main_assets ให้ใช้
            // ถ้าไม่มี แต่เป็น combo และมี skumain ให้ใช้ skumain
            // ถ้าไม่มี ให้ใช้จาก productData (ตัวลูก/ตัวแรกที่หาเจอ)
            $finalPid = $productData['pid'] ?? ''; // ค่า Default จากตัวลูก

            if (!empty($mainAssetData['pid'])) {
                $finalPid = $mainAssetData['pid'];
            } elseif (($apiData['is_combo'] ?? false) && !empty($apiData['skumain'])) {
                $finalPid = $apiData['skumain'];
            }

            // 3. กำหนด PNAME (ชื่อสินค้า)
            $finalName = $productData['pname'] ?? '';
            if (!empty($mainAssetData['pname'])) {
                $finalName = $mainAssetData['pname'];
            }

            // 4. กำหนด Model (รุ่น)
            $finalModel = $productData['facmodel'] ?? '';
            if (!empty($mainAssetData['facmodel'])) {
                $finalModel = $mainAssetData['facmodel'];
            }

            // 5. กำหนด Image
            // Logic เดิมคือหาจากลูก แต่ถ้า main มีรูป ใช้ของ main ดีกว่า
            $finalImage = $imageUrl; // ค่าจาก Logic เดิมข้างบน
            if (!empty($mainAssetData['imagesku'])) {
                if (is_array($mainAssetData['imagesku'])) {
                    $finalImage = $mainAssetData['imagesku'][0] ?? $finalImage;
                } elseif (is_string($mainAssetData['imagesku'])) {
                    $finalImage = $mainAssetData['imagesku'];
                }
            }

            $mappedProductDetail = [
                // 'pid'               => $productData['pid'] ?? '',          // รหัสสินค้า (เช่น TX-8241)
                // 'pname'             => $productData['pname'] ?? '',        // ชื่อสินค้า
                // 'fac_model'         => $productData['facmodel'] ?? '',     // รุ่น
                // 'image'             => $imageUrl,                          // URL รูปภาพ

                'pid'               => $finalPid,
                'pname'             => $finalName,
                'fac_model'         => $finalModel,
                'image'             => $finalImage,

                'warrantyperiod'    => $productData['warrantyperiod'] ?? '',
                'warrantycondition' => $productData['warrantycondition'] ?? '',
                'warrantynote'      => $productData['warrantynote'] ?? '',

                'is_combo'          => $apiData['is_combo'] ?? false,
                'skumain'           => $apiData['skumain'] ?? '',
                'combo_skus'        => $apiData['skuset'] ?? [],
                'power_accessories' => $apiData['power_accessories'] ?? null,
                'assets'            => $apiData['assets'] ?? [],
                'main_assets'       => $apiData['main_assets'] ?? [],
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

    /*
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
                // gen unlockkey ไม่ซ้ำq
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
                'warranty_from' => 'warranty_pupmkin_crm',
                'customer_code' => $req['customer_code'] ?? null,
                'customer_name' => $req['customer_name'] ?? null,
                'pc_code' => $request->pc_code ?? null,
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
    */

    /*
    //บันทึกข้อมูลสินค้าที่มี Power Accessory
    public function store(WrFormRequest $request)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();
            $req = $request->validated();

            // 1. จัดการข้อมูลลูกค้าและไฟล์แนบ (ทำครั้งเดียวใช้ร่วมกัน)
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

            // จัดการ Customer (Find or Create)
            $customer = TblCustomerProd::where('cust_line', $user->line_id)
                ->orWhere('cust_tel', $phone)
                ->first();

            if (!$customer) {
                do {
                    $unlockkey = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                } while (TblCustomerProd::where('unlockkey', $unlockkey)->exists());

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
                if (empty($customer->cust_tel)) {
                    $customer->update(['cust_tel' => $phone]);
                }
            }

            // อัปเดตเบอร์ User
            if (empty($user->phone)) {
                $user->update(['phone' => $phone]);
            }

            // 2. เตรียมรายการสินค้าที่จะบันทึก (Main + Accessories)
            $itemsToSave = [];

            // 2.1 เพิ่มสินค้าหลัก (Main Product)
            $itemsToSave[] = [
                'type'              => 'main',
                'model_code'        => $req['model_code'],
                'model_name'        => $req['model_name'],
                'product_name'      => $req['product_name'],
                // สินค้าหลักใช้ condition จากที่กรอกมา หรือเดี๋ยวไปดึง API ถ้าว่าง
                'warrantycondition' => $req['warrantycondition'] ?? null,
                'warrantynote'      => $req['warrantynote'] ?? null,
            ];

            // 2.2 ตรวจสอบ Power Accessories จาก API (เพื่อความชัวร์และดึงข้อมูล SKU/Condition)
            try {
                $apiUrl = 'https://warranty-sn.pumpkin.tools/api/getdata';
                $apiCheck = Http::timeout(10)
                    ->withOptions(['verify' => false])
                    ->get($apiUrl, ['search' => $req['serial_number']]);

                if ($apiCheck->successful()) {
                    $apiData = $apiCheck->json();

                    // ตรวจสอบว่ามี accessories หรือไม่
                    if (!empty($apiData['power_accessories'])) {
                        $accessories = $apiData['power_accessories'];
                        $accList = [];

                        // รวม Battery และ Charger เข้าด้วยกัน
                        if (isset($accessories['battery']) && is_array($accessories['battery'])) {
                            $accList = array_merge($accList, $accessories['battery']);
                        }
                        if (isset($accessories['charger']) && is_array($accessories['charger'])) {
                            $accList = array_merge($accList, $accessories['charger']);
                        }

                        // วนลูปเพิ่มลงในรายการที่จะบันทึก
                        foreach ($accList as $acc) {
                            $itemsToSave[] = [
                                'type'              => 'accessory',
                                'model_code'        => $acc['accessory_sku'],  // ใช้ SKU ของอะไหล่
                                'model_name'        => $acc['product_name'],   // ใช้ชื่อสินค้าเป็น model name ไปด้วย
                                'product_name'      => $acc['product_name'],
                                'warrantycondition' => $acc['warranty_condition'] ?? null, // ดึง Condition ของอะไหล่
                                'warrantynote'      => $acc['warranty_note'] ?? null,
                            ];
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('⚠️ [Store] Failed to fetch accessories: ' . $e->getMessage());
            }

            // ตัวแปรสำหรับเก็บ Record หลักไว้ส่ง Line Notification
            $mainStoreRecord = null;

            // 3. เริ่มวนลูปบันทึก (Loop Recording)
            foreach ($itemsToSave as $item) {

                // 3.1 บันทึกลง Database
                $store = TblHistoryProd::create([
                    'approval'      => '',
                    'lineid'        => $user->line_id ?? null,
                    'cust_tel'      => $phone,
                    'reward'        => null,
                    'serial_number' => $req['serial_number'], // ใช้ Serial เดิมทุกรายการ
                    'model_code'    => $item['model_code'],   // SKU เปลี่ยนตามลูป
                    'model_name'    => $item['model_name'],
                    'product_name'  => $item['product_name'],
                    'buy_from'      => $req['buy_from'],
                    'store_name'    => $req['store_name'],
                    'buy_date'      => $req['buy_date'],
                    'slip'          => $full_path,
                    'approver'      => null,
                    'round'         => null,
                    'warranty_from' => 'warranty_pupmkin_crm',
                    'customer_code' => $req['customer_code'] ?? null,
                    'customer_name' => $req['customer_name'] ?? null,
                    'pc_code'       => $request->pc_code ?? null,
                ]);

                // เก็บตัวหลักไว้ใช้อ้างอิงตอนส่ง Line
                if ($item['type'] === 'main') {
                    $mainStoreRecord = $store;
                }

                // 3.2 เตรียม Payload สำหรับ Rocket API
                try {
                    $rocketUrl = env('ROCKET_URL_API');
                    $merchantId = env('MERCHANT_ID_ROCKET_NEW');
                    $apiKey = env('API_KEY_ROCKET_NEW');
                    $productImageUri = env('VITE_PRODUCT_IMAGE_URI');
                    $userId = $user->id;
                    $sellerId = 'SELLER-' . ($user->id ?? 0);

                    // // *หมายเหตุ: Logic นี้เป็นตัวอย่าง ถ้ามี field warranty_period จาก API ให้ใช้ค่าจริง
                    // $expireDate = ($item['type'] === 'main')
                    //     ? now()->addYears(2)->toIso8601String()
                    //     : now()->addYear(1)->toIso8601String();

                    // คำนวณวันหมดอายุจาก warranty_period (เดือน)
                    $expireDate = null;
                    $warrantyMonths = intval($item['warranty_period'] ?? 0);

                    if ($warrantyMonths > 0) {
                        // วันที่ซื้อ + จำนวนเดือน
                        $buyDate = $store->buy_date ? Carbon::parse($store->buy_date) : now();
                        $expireDate = $buyDate->addMonths($warrantyMonths)->toIso8601String();
                    }
                    // ถ้าไม่มีค่า ($warrantyMonths = 0) $expireDate จะเป็น null (ปล่อยว่าง)

                    $payload = [
                        'merchant_id' => $merchantId,
                        'user_id' => (string)$userId,
                        'user_phone_number' => '+66' . ltrim($phone, '0'),
                        'warranty_id' => 'WARRANTY-' . $store->id,
                        'product_name' => $store->product_name,
                        'product_code' => $store->model_code,
                        'product_model' => $store->model_name,
                        // รูปภาพเปลี่ยนตาม SKU
                        'product_image' => $productImageUri . '/' . $store->model_code . '.jpg',
                        'warranty_image' => $full_path,
                        'serial_number' => $store->serial_number,
                        'channel' => $store->buy_from,
                        'store' => $store->store_name,
                        'seller_id' => $sellerId,
                        'condition' => [],
                        'remark' => [],
                        'expire_warranty_date' => $expireDate,
                        'purchase_date' => $store->buy_date
                            ? Carbon::parse($store->buy_date)->toIso8601String()
                            : now()->toIso8601String(),
                    ];

                    // จัดการ Condition / Remark
                    $condText = $item['warrantycondition'];
                    $noteText = $item['warrantynote'];

                    // หากเป็นสินค้าหลัก และข้อมูลว่าง ให้ลองไปดึงจาก API (เหมือน Logic เดิม)
                    if ($item['type'] === 'main' && (empty($condText) || empty($noteText))) {
                        try {
                            $pResponse = Http::timeout(5)->withOptions(['verify' => false])
                                ->post(env('VITE_R_MAIN_PRODUCT'), [
                                    'pid' => $store->model_code,
                                    'views' => 'single',
                                ]);
                            if ($pResponse->successful()) {
                                $clean = preg_replace('/<br\s*\/?>\s*<b>.*?<\/b>.*?<br\s*\/?>/s', '', $pResponse->body());
                                $clean = preg_replace('/^.*?(\{.*\})$/s', '$1', $clean);
                                $jsonP = json_decode($clean, true);
                                if (($jsonP['status'] ?? '') === 'SUCCESS') {
                                    $assetsP = $jsonP['assets'] ?? [];
                                    $assetP = reset($assetsP);
                                    if ($assetP) {
                                        if (empty($condText)) $condText = $assetP['warrantycondition'] ?? '';
                                        if (empty($noteText)) $noteText = $assetP['warrantynote'] ?? '';
                                    }
                                }
                            }
                        } catch (\Throwable $e) {
                        }
                    }

                    // ใส่ลง Payload
                    if (!empty($condText)) {
                        $payload['condition'] = preg_split('/[\n\r]+/', trim($condText));
                    }
                    if (!empty($noteText)) {
                        $payload['remark'] = preg_split('/[\n\r]+/', trim($noteText));
                    }

                    // ส่งข้อมูลไป Rocket
                    $rocketResponse = Http::timeout(20)
                        ->withOptions(['verify' => false])
                        ->withHeaders([
                            'Content-Type' => 'application/json',
                            'rocket-merchant-id' => $merchantId,
                            'X-API-KEY' => $apiKey,
                        ])
                        ->post($rocketUrl, $payload);

                    Log::info("🚀 [Rocket Sync] Item: {$item['model_code']} | Status: " . $rocketResponse->status());
                } catch (\Exception $e) {
                    Log::error('❌ [Rocket Sync] Failed', ['sku' => $item['model_code'], 'error' => $e->getMessage()]);
                }
            }

            DB::commit();

            // 4. ส่งแจ้งเตือน LINE (ใช้ข้อมูลสินค้าหลักในการแจ้ง)
            // ถ้าไม่มีข้อมูลสินค้าหลัก (กรณีแปลกๆ) ให้ใช้ตัวสุดท้ายที่วนลูปจบ
            $lineTargetStore = $mainStoreRecord ?? $store;

            try {
                $lineUid = $lineTargetStore->lineid;
                $token = env('LINE_CHANNEL_ACCESS_TOKEN');

                if ($lineUid && $token) {
                    $accessoryCount = count($itemsToSave) - 1;
                    $extraMsg = ($accessoryCount > 0) ? " (และอุปกรณ์เสริม $accessoryCount รายการ)" : "";

                    $message = [
                        'to' => $lineUid,
                        'messages' => [[
                            'type' => 'text',
                            'text' => "ขอบพระคุณสำหรับการลงทะเบียน 🙏\n" .
                                // "สินค้า: " . ($lineTargetStore->product_name ?? '-') . $extraMsg . "\n" .
                                // "Serial: " . ($lineTargetStore->serial_number ?? '-') . "\n" .
                                "แอดมินกำลังตรวจสอบข้อมูลของท่าน"
                        ]],
                    ];

                    Http::withHeaders([
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer ' . $token,
                    ])->post('https://api.line.me/v2/bot/message/push', $message);
                }
            } catch (\Exception $ex) {
                Log::error('❌ LINE Push Error', ['error' => $ex->getMessage()]);
            }

            return redirect()->route('warranty.history');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error in WarrantyFormController@store', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
        }
    }
    */

    //เพิ่มโลจิกสินค้าที่เป็น Comboset
    public function store(WrFormRequest $request)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();
            $req = $request->validated();

            // 1. จัดการข้อมูลลูกค้าและไฟล์แนบ
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

            // จัดการ Customer (Find or Create)
            $customer = TblCustomerProd::where('cust_line', $user->line_id)
                ->orWhere('cust_tel', $phone)
                ->first();

            if (!$customer) {
                do {
                    $unlockkey = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                } while (TblCustomerProd::where('unlockkey', $unlockkey)->exists());

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
                if (empty($customer->cust_tel)) {
                    $customer->update(['cust_tel' => $phone]);
                }
            }

            if (empty($user->phone)) {
                $user->update(['phone' => $phone]);
            }

            // 2. เตรียมข้อมูลสินค้า (Main Single / Main Combo / Accessories)
            $itemsToSave = [];
            $apiData = [];

            // เรียก API เช็คข้อมูล
            try {
                $apiUrl = 'https://warranty-sn.pumpkin.tools/api/getdata';
                $apiResponse = Http::timeout(10)
                    ->withOptions(['verify' => false])
                    ->get($apiUrl, ['search' => $req['serial_number']]);

                if ($apiResponse->successful()) {
                    $apiData = $apiResponse->json();
                }
            } catch (\Exception $e) {
                Log::warning('⚠️ [Store] API Fetch Error: ' . $e->getMessage());
            }

            // 2.1 ตรวจสอบว่าเป็น COMBO SET หรือไม่?
            $isCombo = isset($apiData['is_combo']) && $apiData['is_combo'] === true;

            $targetMainSku = ($isCombo && !empty($apiData['skumain']))
                ? $apiData['skumain']
                : $req['model_code'];

            if ($isCombo) {
                // กรณี Combo: วนลูป skuset
                $skuset = $apiData['skuset'] ?? [];
                $assets = $apiData['assets'] ?? [];

                foreach ($skuset as $sku) {
                    if (isset($assets[$sku])) {
                        $asset = $assets[$sku];
                        $itemsToSave[] = [
                            // 'type'              => 'main',
                            'type'              => 'combo_item',
                            'model_code'        => $asset['pid'],
                            'sku_main'          => $targetMainSku,
                            'model_name'        => $asset['facmodel'] ?? $req['model_name'],
                            'product_name'      => $asset['pname'] ?? $req['product_name'],
                            'warrantycondition' => $asset['warrantycondition'] ?? null,
                            'warrantynote'      => $asset['warrantynote'] ?? null,
                            // ดึง Warranty Period จาก API
                            'warranty_period'   => $asset['warrantyperiod'] ?? null,
                        ];
                    }
                }
                // Fallback Combo
                if (empty($itemsToSave)) {
                    $itemsToSave[] = [
                        'type'              => 'main',
                        'model_code'        => $req['model_code'],
                        'sku_main'          => null,
                        'model_name'        => $req['model_name'],
                        'product_name'      => $req['product_name'],
                        'warrantycondition' => $req['warrantycondition'] ?? null,
                        'warrantynote'      => $req['warrantynote'] ?? null,
                        'warranty_period'   => null,
                    ];
                }
            } else {
                // กรณีสินค้าปกติ (Single)
                // พยายามดึง Period จาก API Assets (ถ้ามีข้อมูล)
                $singleAsset = $apiData['assets'][$req['model_code']] ?? null;

                $itemsToSave[] = [
                    'type'              => 'single',
                    'model_code'        => $req['model_code'],
                    'sku_main'          => null,
                    'model_name'        => $req['model_name'],
                    'product_name'      => $req['product_name'],
                    'warrantycondition' => $req['warrantycondition'] ?? ($singleAsset['warrantycondition'] ?? null),
                    'warrantynote'      => $req['warrantynote'] ?? ($singleAsset['warrantynote'] ?? null),
                    // ดึง Warranty Period จาก API 
                    'warranty_period'   => $singleAsset['warrantyperiod'] ?? null,
                ];
            }

            // 2.2 ตรวจสอบ Power Accessories
            if (!empty($apiData['power_accessories'])) {
                $accessories = $apiData['power_accessories'];
                $accList = [];

                if (isset($accessories['battery']) && is_array($accessories['battery'])) {
                    $accList = array_merge($accList, $accessories['battery']);
                }
                if (isset($accessories['charger']) && is_array($accessories['charger'])) {
                    $accList = array_merge($accList, $accessories['charger']);
                }

                foreach ($accList as $acc) {
                    $itemsToSave[] = [
                        'type'              => 'accessory',
                        'model_code'        => $acc['accessory_sku'],
                        'sku_main'          => $targetMainSku,
                        'model_name'        => $acc['product_name'],
                        'product_name'      => $acc['product_name'],
                        'warrantycondition' => $acc['warranty_condition'] ?? null,
                        'warrantynote'      => $acc['warranty_note'] ?? null,
                        // ดึง Warranty Period จาก API (Key ของอะไหล่คือ warranty_period)
                        'warranty_period'   => $acc['warranty_period'] ?? null,
                    ];
                }
            }

            $mainStoreRecord = null;

            // 3. วนลูปบันทึก
            foreach ($itemsToSave as $item) {

                // 3.1 บันทึก DB
                $store = TblHistoryProd::create([
                    'approval'      => '',
                    'lineid'        => $user->line_id ?? null,
                    'cust_tel'      => $phone,
                    'reward'        => null,
                    'serial_number' => $req['serial_number'],
                    'model_code'    => $item['model_code'],
                    'sku_main'      => $item['sku_main'],
                    'product_type'  => $item['type'],
                    'model_name'    => $item['model_name'],
                    'product_name'  => $item['product_name'],
                    'buy_from'      => $req['buy_from'],
                    'store_name'    => $req['store_name'],
                    'buy_date'      => $req['buy_date'],
                    'slip'          => $full_path,
                    'approver'      => null,
                    'round'         => null,
                    'warranty_from' => 'warranty_pupmkin_crm',
                    'customer_code' => $req['customer_code'] ?? null,
                    'customer_name' => $req['customer_name'] ?? null,
                    // 'pc_code'       => $request->pc_code ?? null,
                    'pc_code'       => $req['pc_code'] ?? null,
                ]);

                if ($item['type'] === 'main' && !$mainStoreRecord) {
                    $mainStoreRecord = $store;
                }

                // 3.2 Rocket API Sync
                try {
                    $rocketUrl = env('ROCKET_URL_API');
                    $merchantId = env('MERCHANT_ID_ROCKET_NEW');
                    $apiKey = env('API_KEY_ROCKET_NEW');
                    $productImageUri = env('VITE_PRODUCT_IMAGE_URI');
                    $userId = $user->id;
                    $sellerId = 'SELLER-' . ($user->id ?? 0);

                    // คำนวณวันหมดอายุจาก warranty_period (เดือน)
                    $expireDate = null;
                    $warrantyMonths = intval($item['warranty_period'] ?? 0);

                    if ($warrantyMonths > 0) {
                        // วันที่ซื้อ + จำนวนเดือน
                        $buyDate = $store->buy_date ? Carbon::parse($store->buy_date) : now();
                        $expireDate = $buyDate->addMonths($warrantyMonths)->toIso8601String();
                    }
                    // ถ้าไม่มีค่า ($warrantyMonths = 0) $expireDate จะเป็น null (ปล่อยว่าง)

                    $payload = [
                        'merchant_id' => $merchantId,
                        'user_id' => (string)$userId,
                        'user_phone_number' => '+66' . ltrim($phone, '0'),
                        'warranty_id' => 'WARRANTY-' . $store->id,
                        'product_name' => $store->product_name,
                        'product_code' => $store->model_code,
                        'product_model' => $store->model_name,
                        'product_image' => $productImageUri . '/' . $store->model_code . '.jpg',
                        'warranty_image' => $full_path,
                        'serial_number' => $store->serial_number,
                        'channel' => $store->buy_from,
                        'store' => $store->store_name,
                        'seller_id' => $sellerId,
                        'condition' => [],
                        'remark' => [],
                        'expire_warranty_date' => $expireDate, // ใช้ค่าที่คำนวณ หรือ null
                        'purchase_date' => $store->buy_date
                            ? Carbon::parse($store->buy_date)->toIso8601String()
                            : now()->toIso8601String(),
                    ];

                    $condText = $item['warrantycondition'];
                    $noteText = $item['warrantynote'];

                    if (!empty($condText)) {
                        $payload['condition'] = preg_split('/[\n\r]+/', trim($condText));
                    }
                    if (!empty($noteText)) {
                        $payload['remark'] = preg_split('/[\n\r]+/', trim($noteText));
                    }

                    Http::timeout(10)
                        ->withOptions(['verify' => false])
                        ->withHeaders([
                            'Content-Type' => 'application/json',
                            'rocket-merchant-id' => $merchantId,
                            'X-API-KEY' => $apiKey,
                        ])
                        ->post($rocketUrl, $payload);
                } catch (\Exception $e) {
                    Log::error('❌ [Rocket Sync] Failed', ['sku' => $item['model_code']]);
                }
            }

            DB::commit();

            // 4. LINE Notification
            $lineTargetStore = $mainStoreRecord ?? $store;

            try {
                $lineUid = $lineTargetStore->lineid;
                $token = env('LINE_CHANNEL_ACCESS_TOKEN');

                if ($lineUid && $token) {
                    // $totalItems = count($itemsToSave);
                    $msgText = "ขอบพระคุณสำหรับการลงทะเบียน 🙏\n";

                    // if ($isCombo) {
                    //     $msgText .= "📦 สินค้าชุด Combo Set (จำนวน $totalItems รายการ)\n";
                    // } else {
                    //     $extraMsg = ($totalItems > 1) ? " (และอุปกรณ์เสริม " . ($totalItems - 1) . " รายการ)" : "";
                    //     $msgText .= "📦 สินค้า: " . ($lineTargetStore->product_name ?? '-') . $extraMsg . "\n";
                    // }

                    $msgText .= "แอดมินกำลังตรวจสอบข้อมูลของท่าน";

                    $message = [
                        'to' => $lineUid,
                        'messages' => [[
                            'type' => 'text',
                            'text' => $msgText,
                        ]],
                    ];

                    Http::withHeaders([
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer ' . $token,
                    ])->post('https://api.line.me/v2/bot/message/push', $message);
                }
            } catch (\Exception $ex) {
                Log::error('❌ LINE Push Error', ['error' => $ex->getMessage()]);
            }

            return redirect()->route('warranty.history');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error in WarrantyFormController@store', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
        }
    }
}
