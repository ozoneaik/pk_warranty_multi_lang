<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Http\Requests\Warranty\WrFormRequest;
use App\Models\MasterWaaranty\Dealer;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TblHistoryProd;
use App\Models\MasterWaaranty\TypeProcessPoint;
use App\Services\WarrantyFallbackService;
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
        $fallback = new WarrantyFallbackService();
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
            $response = Http::timeout(5)          // ลด timeout ลงเพื่อ failfast
                ->connectTimeout(3)
                ->withOptions(['verify' => false])
                ->get($uri, ['name' => 'ช่องทางการซื้อ']);

            if ($response->successful()) {
                $data = $response->json();
                $channel_list = is_array($data) ? $data : [];

                // อัปเดต fallback ทันทีที่ API สำเร็จ
                $fallback->updateChannelCache($channel_list);

                Log::channel('warranty')->info('[form] โหลด channel_list จาก API สำเร็จ', [
                    'count' => count($channel_list),
                ]);
            } else {
                throw new \Exception('HTTP ' . $response->status());
            }
        } catch (\Throwable $e) {
            Log::channel('warranty')->warning('[form] API ล้มเหลว ใช้ fallback แทน', [
                'error' => $e->getMessage(),
            ]);

            // ใช้ fallback
            $channel_list = $fallback->getChannels();
        }

        return Inertia::render('Warranty/WarrantyForm', [
            'channel_list'   => $channel_list,
            'has_phone'      => $has_phone,
            'current_phone'  => $current_phone,
        ]);
    }

    // get_store_name() — ดึง Store List
    public function get_store_name($id, Request $request)
    {
        $fallback    = new WarrantyFallbackService();
        $channelName = $request->input('channel_name');

        // 2. ดึงจาก Pumpkin API
        $uri = "https://pk-api.pumpkin-th.com/api/get-store-name/{$id}";

        Log::channel('warranty')->info('[get_store_name] เริ่มดึงร้านค้า', [
            'id'  => $id,
            'channel_name' => $channelName,
        ]);

        $apiStoreList = [];
        $usedFallback = false;

        try {
            $response = Http::timeout(5)
                ->connectTimeout(3)
                ->withOptions(['verify' => false])
                ->get($uri);

            if ($response->successful()) {
                $data = $response->json();
                $apiStoreList = is_array($data) ? $data : [];

                // อัปเดต fallback ทันที
                $fallback->updateStoreCache($id, $apiStoreList);

                Log::channel('warranty')->info('[get_store_name] API สำเร็จ', [
                    'id'    => $id,
                    'count' => count($apiStoreList),
                ]);
            } else {
                throw new \Exception('HTTP ' . $response->status());
            }
        } catch (\Throwable $e) {
            Log::channel('warranty')->warning('[get_store_name] API ล้มเหลว ใช้ fallback', [
                'id'    => $id,
                'error' => $e->getMessage(),
            ]);

            // ใช้ fallback
            $apiStoreList = $fallback->getStoresByChannelId($id);
            $usedFallback = true;
        }

        // ตัวแทนจำหน่าย: รวมกับ DB
        $dbStoreList = Dealer::where('channel_id', $id)
            ->where('is_active', true)
            ->pluck('name')
            ->toArray();

        $finalStoreList = array_values(array_unique(array_merge($apiStoreList, $dbStoreList)));

        return response()->json([
            'message'      => 'ดึงรายการสำเร็จ',
            'list'         => $finalStoreList,
            'used_fallback' => $usedFallback, // แจ้ง frontend ถ้าต้องการ
        ]);
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

            // 1. เช็คว่า Serial นี้เคยลงทะเบียนไปแล้วหรือยัง
            $check_form_history = TblHistoryProd::query()
                ->where('serial_number', $sn)
                ->select('serial_number', 'model_code', 'product_name', 'model_name')
                ->first();

            if ($check_form_history) {
                throw new \Exception('หมายเลขซีเรียลนี้ถูกลงทะเบียนในระบบแล้ว');
            }

            Log::channel('warranty')->info('🛰 [WarrantyFormController] เริ่มตรวจสอบ SN จาก API ใหม่', ['sn' => $sn]);

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

            Log::channel('warranty')->info('📡 [WarrantyFormController] ผลลัพธ์จาก API', [
                'status' => $apiData['status'] ?? 'N/A',
                'is_combo' => $apiData['is_combo'] ?? false,
                'skuset' => $apiData['skuset'] ?? []
            ]);

            if (($apiData['status'] ?? '') !== 'SUCCESS') {
                throw new \Exception('ไม่พบข้อมูลหมายเลขซีเรียลนี้ในระบบ');
            }

            if (!str_contains($apiData['search_type'] ?? '', 'serial')) {
                throw new \Exception('ระบบอนุญาตให้ค้นหาด้วยหมายเลขซีเรียล (Serial) เท่านั้น');
            }

            $isExpired = $apiData['warrantyexpire'] ?? false;
            if ($isExpired === true || $isExpired === 'true') {
                throw new \Exception('หมายเลขซีเรียลนี้หมดอายุรับประกัน หรือถูกใช้งานไปแล้ว');
            }

            // =========================================================
            // LOGIC ใหม่: การดึงข้อมูลให้ยึดจาก Main Assets เป็นหลัก
            // =========================================================
            $main_assets = $apiData['main_assets'] ?? [];
            $main_serial = $main_assets['serial'] ?? null;

            // ตรวจสอบว่าถ้าหาด้วย Serial อะไหล่ (Serial ที่หา ไม่ตรงกับ Serial หลัก) ให้สลับไปใช้ข้อมูลหลักแทน
            if (!empty($main_assets) && !empty($main_serial) && $sn !== $main_serial) {

                // ใช้ PID และข้อมูลหลักจาก main_assets เสมอ
                $finalPid    = $main_assets['pid'] ?? ($apiData['skumain'] ?? '');
                $finalName   = $main_assets['pname'] ?? '';
                $finalModel  = $main_assets['facmodel'] ?? $finalPid;

                // ส่ง Serial หลักกลับไปเพื่อให้ Frontend บันทึกด้วย Serial ตัวแม่
                $display_serial = $main_serial;

                // การดึงรูปภาพของ Main Asset
                $finalImage = '';
                if (!empty($main_assets['imagesku'])) {
                    if (is_array($main_assets['imagesku'])) {
                        $finalImage = $main_assets['imagesku'][0] ?? '';
                    } elseif (is_string($main_assets['imagesku'])) {
                        $finalImage = $main_assets['imagesku'];
                    }
                }

                $warrantyperiod    = $main_assets['warrantyperiod'] ?? '';
                $warrantycondition = $main_assets['warrantycondition'] ?? '';
                $warrantynote      = $main_assets['warrantynote'] ?? '';
            } else {
                // กรณีค้นหาด้วย Serial หลักตรงๆ หรือสินค้าปกติ (ไม่มี main_assets)
                $assets = $apiData['assets'] ?? [];

                if (empty($assets)) {
                    throw new \Exception('พบ Serial Number แต่ไม่พบข้อมูลสินค้า (Assets Empty)');
                }

                // หา Target SKU
                $targetSku = $apiData['skumain'] ?? null;
                if (!$targetSku && !empty($apiData['skuset'])) {
                    $targetSku = $apiData['skuset'][0];
                }

                $productData = null;
                if ($targetSku && isset($assets[$targetSku])) {
                    $productData = $assets[$targetSku];
                } else {
                    $productData = reset($assets);
                }

                if (!$productData) {
                    throw new \Exception('ไม่สามารถดึงรายละเอียดสินค้าได้');
                }

                $finalPid    = $productData['pid'] ?? '';
                $finalName   = $productData['pname'] ?? '';
                $finalModel  = $productData['facmodel'] ?? '';
                $display_serial = $sn; // ใช้ Serial ที่หามา

                $finalImage = '';
                if (!empty($productData['imagesku'])) {
                    if (is_array($productData['imagesku'])) {
                        $finalImage = $productData['imagesku'][0] ?? '';
                    } elseif (is_string($productData['imagesku'])) {
                        $finalImage = $productData['imagesku'];
                    }
                }

                $warrantyperiod    = $productData['warrantyperiod'] ?? '';
                $warrantycondition = $productData['warrantycondition'] ?? '';
                $warrantynote      = $productData['warrantynote'] ?? '';
            }

            // =========================================================
            // จัดเตรียมข้อมูล Combo Items (ถ้ามี)
            // =========================================================
            $is_combo = $apiData['is_combo'] ?? false;
            $combo_skus = [];

            if ($is_combo && !empty($apiData['skuset'])) {
                // กรองเฉพาะรหัสลูกจริงๆ เอา main ออก (เพื่อไม่ให้แสดงซ้ำ)
                // หรือถ้าอยากส่งกลับหมดก็ส่ง $apiData['skuset'] ไปได้เลย
                $combo_skus = $apiData['skuset'];
            }

            // =========================================================
            // จัดโครงสร้างส่งกลับไป Frontend
            // =========================================================
            $mappedProductDetail = [
                'pid'               => $finalPid,
                'pname'             => $finalName,
                'fac_model'         => $finalModel,
                'image'             => $finalImage,
                'warrantyperiod'    => $warrantyperiod,
                'warrantycondition' => $warrantycondition,
                'warrantynote'      => $warrantynote,
                'is_combo'          => $is_combo,
                'skumain'           => $apiData['skumain'] ?? '',
                'combo_skus'        => $combo_skus,
                'power_accessories' => $apiData['power_accessories'] ?? null,
                'assets'            => $apiData['assets'] ?? [],
                'main_assets'       => $main_assets,
            ];

            $data_response = [
                'serial_info'    => ['status' => 'SUCCESS', 'sn' => $display_serial], // ✅ ส่ง Serial ของตัวแม่กลับไป
                'product_detail' => $mappedProductDetail,
            ];

            return response()->json([
                'message' => "ตรวจสอบข้อมูลสำเร็จ",
                'data'    => $data_response
            ], 200);
        } catch (\Exception $e) {
            Log::channel('warranty')->error('❌ [WarrantyFormController] Check SN Error', [
                'sn'    => $sn,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => $e->getMessage(),
                'data'    => []
            ], 400);
        }
    }

    //เพิ่มโลจิกสินค้าที่เป็น Comboset
    public function store(WrFormRequest $request)
    {
        Log::channel('warranty')->info('🚀 [store] เริ่มบันทึกการลงทะเบียนการรับประกัน', [
            'serial_number' => $request->serial_number,
            'user_id' => Auth::id()
        ]);

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
                    Log::channel('warranty')->info('📡 [store] ดึงข้อมูลจาก Warranty API สำเร็จ', [
                        'is_combo' => $apiData['is_combo'] ?? false
                    ]);
                } else {
                    Log::channel('warranty')->warning('⚠️ [store] ดึงข้อมูลจาก Warranty API ไม่สำเร็จ', ['status' => $apiResponse->status()]);
                }
            } catch (\Exception $e) {
                Log::channel('warranty')->warning('⚠️ [Store] API Fetch Error: ' . $e->getMessage());
            }

            // 2.1 ตรวจสอบว่าเป็น COMBO SET หรือไม่?
            $isCombo = isset($apiData['is_combo']) && $apiData['is_combo'] === true;

            $targetMainSku = ($isCombo && !empty($apiData['skumain']))
                ? $apiData['skumain']
                : $req['model_code'];

            if ($isCombo) {
                // 1. เพิ่มข้อมูล "ตัวกล่องหลัก" (Main Asset) ลงไปในคิวก่อน
                $mainAssetData = $apiData['main_assets'] ?? [];
                $itemsToSave[] = [
                    'type'              => 'main',
                    'model_code'        => $mainAssetData['pid'] ?? $req['model_code'],
                    'sku_main'          => null, // ตัวมันเองคือตัวหลัก ไม่ต้องชี้ไปหาใคร
                    'model_name'        => $mainAssetData['facmodel'] ?? $req['model_name'],
                    'product_name'      => $mainAssetData['pname'] ?? $req['product_name'],
                    'warrantycondition' => $mainAssetData['warrantycondition'] ?? ($req['warrantycondition'] ?? null),
                    'warrantynote'      => $mainAssetData['warrantynote'] ?? ($req['warrantynote'] ?? null),
                    'warranty_period'   => $mainAssetData['warrantyperiod'] ?? null,
                ];

                // 2. วนลูป skuset เพื่อเอา "ตัวลูก" ใส่ตามเข้าไป
                $skuset = $apiData['skuset'] ?? [];
                $assets = $apiData['assets'] ?? [];

                foreach ($skuset as $sku) {
                    if (isset($assets[$sku])) {
                        $asset = $assets[$sku];
                        $itemsToSave[] = [
                            'type'              => 'combo_item',
                            'model_code'        => $asset['pid'],
                            'sku_main'          => $targetMainSku, // ชี้ไปหารหัสกล่อง Combo
                            'model_name'        => $asset['facmodel'] ?? $req['model_name'],
                            'product_name'      => $asset['pname'] ?? $req['product_name'],
                            'warrantycondition' => $asset['warrantycondition'] ?? null,
                            'warrantynote'      => $asset['warrantynote'] ?? null,
                            'warranty_period'   => $asset['warrantyperiod'] ?? null,
                        ];
                    }
                }

                // Fallback Combo (เผื่อหาลูกไม่เจอเลย)
                if (count($itemsToSave) === 1) { // มีแค่ตัวหลักตัวเดียว
                    $itemsToSave[0]['warrantycondition'] = $req['warrantycondition'] ?? null;
                    $itemsToSave[0]['warrantynote'] = $req['warrantynote'] ?? null;
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
                        'serial_number'     => !empty($acc['serial_label']) ? $acc['serial_label'] : $req['serial_number'],
                    ];
                }
            }

            Log::channel('warranty')->info('📦 [store] เตรียมบันทึกข้อมูลสินค้า', ['count' => count($itemsToSave)]);

            $mainStoreRecord = null;

            // 3. วนลูปบันทึก
            foreach ($itemsToSave as $item) {

                // 3.1 บันทึก DB
                $store = TblHistoryProd::create([
                    'approval'      => '',
                    'lineid'        => $user->line_id ?? null,
                    'cust_tel'      => $phone,
                    'reward'        => null,
                    'serial_number' => $item['serial_number'] ?? $req['serial_number'],
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

                Log::channel('warranty')->info('✅ [store] บันทึกลง TblHistoryProd สำเร็จ', [
                    'id' => $store->id,
                    'model_code' => $store->model_code,
                    'type' => $store->product_type
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

                    Log::channel('warranty')->info('🚀 [store] Sync to Rocket API สำเร็จ', ['warranty_id' => $payload['warranty_id']]);
                } catch (\Exception $e) {
                    Log::channel('warranty')->error('❌ [Rocket Sync] Failed', [
                        'sku' => $item['model_code'],
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // if (!empty($req['pc_code'])) {
            //     // เช็คว่าไม่ได้ใส่รหัสของตัวเอง
            //     if ($customer && $customer->referral_code === $req['pc_code']) {
            //         Log::channel('warranty')->info('⚪ [Point System] ข้ามการแจกคะแนน: ผู้ใช้ใส่รหัส PC ของตัวเอง');
            //     } else {
            //         try {
            //             $processPoint = TypeProcessPoint::where('process_code', 'PC_CODE')
            //                 ->where('is_active', 1)
            //                 ->first();

            //             if ($processPoint && $processPoint->default_point > 0) {
            //                 $targetStoreRef = $mainStoreRecord ?? $store;

            //                 // คำนวณแต้มก่อนหน้า-หลัง (ถ้าตารางต้องการใช้)
            //                 $currentPoint = $customer ? (int)$customer->point : 0;
            //                 $pointTran = (int)$processPoint->default_point;

            //                 PointTransaction::create([
            //                     'line_id'          => $user->line_id, // 👈 ตรงกับ $fillable
            //                     'transaction_type' => $processPoint->transaction_type ?? 'earn',
            //                     'process_code'     => $processPoint->process_code,
            //                     'reference_id'     => (string)$targetStoreRef->id, // 👈 อ้างอิง ID การลงทะเบียน
            //                     'pid'              => $targetStoreRef->model_code,
            //                     'pname'            => $targetStoreRef->product_name,
            //                     'product_type'     => $targetStoreRef->product_type ?? 'main',
            //                     'point_before'     => $currentPoint,
            //                     'point_tran'       => $pointTran,     // 👈 ตรงกับ $fillable (คะแนนที่ได้)
            //                     'point_after'      => $currentPoint + $pointTran,
            //                     'docdate'          => now()->format('Y-m-d'),
            //                     'docno'            => $req['pc_code'], // 👈 เนื่องจากไม่มีช่อง pc_code เลยขอประยุกต์เก็บใน docno ชั่วคราว (หรือถ้ามีฟิลด์อื่นบอกได้ครับ)
            //                     'trandate'         => now()->format('Y-m-d'),
            //                     'created_at'       => now(),
            //                 ]);

            //                 Log::channel('warranty')->info('🟢 [Point System] บันทึกคะแนนสำเร็จ', [
            //                     'pc_code' => $req['pc_code'],
            //                     'point'   => $pointTran,
            //                 ]);
            //             }
            //         } catch (\Exception $e) {
            //             Log::channel('warranty')->error('❌ [Point System] เกิดข้อผิดพลาดในการแจกคะแนน', ['error' => $e->getMessage()]);
            //         }
            //     }
            // }

            if (!empty($req['pc_code'])) {
                try {
                    // 1. ดึงข้อมูลเงื่อนไขคะแนนของ PC_CODE และเช็คว่า is_active = 1
                    $processPoint = TypeProcessPoint::where('process_code', 'PC_CODE')
                        ->where('is_active', 1)
                        ->first();

                    // 2. ถ้าเจอเงื่อนไขและคะแนนที่ตั้งไว้มากกว่า 0
                    if ($processPoint && $processPoint->default_point > 0) {
                        $targetStoreRef = $mainStoreRecord ?? $store;

                        // คำนวณแต้มก่อนหน้า-หลัง
                        $currentPoint = $customer ? (int)$customer->point : 0;
                        $pointTran = (int)$processPoint->default_point;

                        // 3. บันทึก Transaction
                        PointTransaction::create([
                            'line_id'          => $user->line_id,
                            'transaction_type' => $processPoint->transaction_type ?? 'earn',
                            'process_code'     => $processPoint->process_code,
                            'reference_id'     => (string)$targetStoreRef->id,
                            'pid'              => $targetStoreRef->model_code,
                            'pname'            => $targetStoreRef->product_name,
                            'product_type'     => 'privilege',
                            'point_before'     => $currentPoint,
                            'point_tran'       => $pointTran,
                            'point_after'      => $currentPoint + $pointTran,
                            'docdate'          => now()->format('Y-m-d'),
                            'docno'            => $req['pc_code'], // ใช้เก็บ pc_code 
                            'trandate'         => now()->format('Y-m-d'),
                            'created_at'       => now(),
                        ]);

                        Log::channel('warranty')->info('🟢 [Point System] บันทึกคะแนนสำเร็จ', [
                            'pc_code' => $req['pc_code'],
                            'point'   => $pointTran,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::channel('warranty')->error('❌ [Point System] เกิดข้อผิดพลาดในการแจกคะแนน', [
                        'error' => $e->getMessage()
                    ]);
                }
            }

            DB::commit();

            // 4. LINE Notification
            $lineTargetStore = $mainStoreRecord ?? $store;
            // try {
            //     $lineUid = $lineTargetStore->lineid;
            //     $chatApiUrl = "https://f662-180-180-217-205.ngrok-free.app/api/external/save-chat";
            //     $internalApiKey = "PUMPKIN_SECRET_KEY_2024";
            //     $realCustomerName = $req['customer_name'] ?? ($user->name ?? 'ลูกค้าลงทะเบียน');

            //     if ($lineUid && $internalApiKey) {
            //         $detailText = "ขอบพระคุณสำหรับการลงทะเบียน 🙏\n" .
            //             "ชื่อผู้ลงทะเบียน: {$realCustomerName}\n" .
            //             "แอดมินกำลังตรวจสอบข้อมูลของท่าน\n" .
            //             "สินค้า: " . ($lineTargetStore->product_name ?? '-') . "\n" .
            //             "S/N: " . ($lineTargetStore->serial_number ?? '-');

            //         $chatResponse = Http::timeout(10)
            //             ->withOptions(['verify' => false])
            //             ->withHeaders([
            //                 'X-API-KEY' => $internalApiKey,
            //                 'Content-Type' => 'application/json',
            //             ])
            //             ->post($chatApiUrl, [
            //                 'to' => $lineUid,
            //                 'custName' => $realCustomerName,
            //                 'messages' => [
            //                     [
            //                         'type' => 'text',
            //                         'text' => $detailText
            //                     ]
            //                 ]
            //             ]);

            //         Log::channel('warranty')->info('📩 [Chat API] บันทึกสำเร็จสำหรับลูกค้า: ' . $realCustomerName);
            //     }
            // } catch (\Exception $ex) {
            //     Log::channel('warranty')->error('❌ [Chat API] Error: ' . $ex->getMessage());
            // }

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
                Log::channel('warranty')->error('❌ LINE Push Error', ['error' => $ex->getMessage()]);
            }

            return redirect()->route('warranty.history');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('warranty')->error('❌ [store] บันทึกไม่สำเร็จ', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return back()->withErrors(['error' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()]);
        }
    }
}
