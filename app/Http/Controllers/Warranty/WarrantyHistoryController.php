<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblHistoryProd;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WarrantyHistoryController extends Controller
{
    /*
    public function history()
    {
        $histories = TblHistoryProd::query()
            ->where('lineid', Auth::user()->line_id)
            ->orderByDesc('id')
            ->get([
                'id',
                'serial_number',
                'model_code',
                'model_name',
                'product_name',
                'slip',
                'approval',
                'insurance_expire',
            ]);

        return Inertia::render('Warranty/WarrantyHistory', [
            'histories' => $histories->map(fn($item) => [
                'id' => $item->id,
                'serial_number' => $item->serial_number,
                'model_code' => $item->model_code,
                'model_name' => $item->model_name,
                'product_name' => $item->product_name,
                'slip' => $item->slip,
                'approval' => $item->approval,
                'insurance_expire' => $item->insurance_expire,
            ]),
        ]);
    }
    */

    /*
    public function historyDetail($model_code)
    {
        try {
            $cacheKey = "war:detail:v3:{$model_code}";

            $cached = Cache::get($cacheKey);
            if ($cached !== null) {
                return response()->json(['success' => true, 'data' => $cached]);
            }

            $apiUrl = 'https://warranty-sn.pumpkin.tools/api/getdata';
            $response = Http::timeout(15)
                ->withOptions(['verify' => false])
                ->get($apiUrl, [
                    'search' => $model_code,
                ]);

            if (!$response->successful()) {
                Log::warning('[historyDetail] API not successful', [
                    'model_code' => $model_code,
                    'status'     => $response->status(),
                ]);
                return response()->json(['success' => false, 'data' => []], 200);
            }

            $json = $response->json();

            // ตรวจสอบ Status จาก API ใหม่
            if (($json['status'] ?? '') !== 'SUCCESS') {
                return response()->json(['success' => false, 'data' => []], 200);
            }

            // --- Logic การหา Asset (สินค้า) จาก API ใหม่ ---
            $assets = $json['assets'] ?? [];
            $skuset = $json['skuset'] ?? [];

            $asset = null;
            $targetSku = null;

            // 1. ลองหาจาก model_code โดยตรง
            if (isset($assets[$model_code])) {
                $asset = $assets[$model_code];
                $targetSku = $model_code;
            }
            // 2. ลองหาจาก skumain
            elseif (isset($json['skumain']) && isset($assets[$json['skumain']])) {
                $asset = $assets[$json['skumain']];
                $targetSku = $json['skumain'];
            }
            // 3. ลองหาจากตัวแรกใน skuset
            elseif (!empty($skuset) && isset($assets[$skuset[0]])) {
                $asset = $assets[$skuset[0]];
                $targetSku = $skuset[0];
            }
            // 4. ถ้ายังไม่เจอ ให้เอาตัวแรกสุดใน assets
            elseif (!empty($assets)) {
                $targetSku = array_key_first($assets);
                $asset = $assets[$targetSku];
            }

            // ถ้าไม่มีข้อมูลสินค้า ให้ return empty
            if (!$asset) {
                return response()->json(['success' => true, 'data' => []], 200);
            }

            // --- Map ข้อมูลลง Structure เดิม ---
            $data = [
                'warrantyperiod'    => $asset['warrantyperiod']    ?? null,
                'warrantycondition' => $asset['warrantycondition'] ?? null,
                'warrantynote'      => $asset['warrantynote']      ?? null,

                // ข้อมูลเหล่านี้ใน API ใหม่อยู่ที่ Root โดยใช้ SKU เป็น Key
                'sp_warranty'       => $json['sp_warranty'][$targetSku] ?? [],
                'sp'                => $json['sp'][$targetSku]          ?? [],
                'listbehavior'      => $json['listbehavior'][$targetSku] ?? [],

                'power_accessories' => $json['power_accessories']  ?? [],
            ];

            Cache::put($cacheKey, $data, now()->addDay());
            return response()->json(['success' => true, 'data' => $data], 200);
        } catch (\Throwable $e) {
            Log::error('[historyDetail] Exception', [
                'model_code' => $model_code,
                'error'      => $e->getMessage(),
            ]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
        }
    }
    */

    public function history()
    {
        $histories = TblHistoryProd::query()
            ->where('lineid', Auth::user()->line_id)
            ->orderByDesc('id')
            ->get([
                'id',
                'serial_number',
                'model_code',
                'model_name',
                'product_name',
                'slip',
                'approval',
                'insurance_expire',
            ]);

        return Inertia::render('Warranty/WarrantyHistory', [
            'histories' => $histories->map(fn($item) => [
                'id' => $item->id,
                'serial_number' => $item->serial_number,
                'model_code' => $item->model_code,
                'model_name' => $item->model_name,
                'product_name' => $item->product_name,
                'slip' => $item->slip,
                'approval' => $item->approval,
                'insurance_expire' => $item->insurance_expire,
            ]),
        ]);
    }

    /*
    // Updated to use serial_number
    public function historyDetail($serial_number)
    {
        try {
            // Cache by Serial Number
            $cacheKey = "war:detail:sn:v1:{$serial_number}";

            $cached = Cache::get($cacheKey);
            if ($cached !== null) {
                return response()->json(['success' => true, 'data' => $cached]);
            }

            $apiUrl = 'https://warranty-sn.pumpkin.tools/api/getdata';
            $response = Http::timeout(15)
                ->withOptions(['verify' => false])
                ->get($apiUrl, [
                    'search' => $serial_number, // Search by Serial
                ]);

            if (!$response->successful()) {
                Log::warning('[historyDetail] API not successful', [
                    'serial_number' => $serial_number,
                    'status'     => $response->status(),
                ]);
                return response()->json(['success' => false, 'data' => []], 200);
            }

            $json = $response->json();

            if (($json['status'] ?? '') !== 'SUCCESS') {
                return response()->json(['success' => false, 'data' => []], 200);
            }

            // --- Logic การหา Asset ---
            $assets = $json['assets'] ?? [];
            $skuset = $json['skuset'] ?? [];

            $asset = null;
            $targetSku = null;

            // 1. หาจาก skumain (แม่นยำที่สุดเมื่อค้นด้วย Serial)
            if (isset($json['skumain']) && isset($assets[$json['skumain']])) {
                $asset = $assets[$json['skumain']];
                $targetSku = $json['skumain'];
            }
            // 2. หาจากตัวแรกใน skuset
            elseif (!empty($skuset) && isset($assets[$skuset[0]])) {
                $asset = $assets[$skuset[0]];
                $targetSku = $skuset[0];
            }
            // 3. Fallback: เอาตัวแรกสุดใน assets
            elseif (!empty($assets)) {
                $targetSku = array_key_first($assets);
                $asset = $assets[$targetSku];
            }

            if (!$asset) {
                return response()->json(['success' => true, 'data' => []], 200);
            }

            $data = [
                'warrantyperiod'    => $asset['warrantyperiod']    ?? null,
                'warrantycondition' => $asset['warrantycondition'] ?? null,
                'warrantynote'      => $asset['warrantynote']      ?? null,

                // Data based on SKU
                'sp_warranty'       => $json['sp_warranty'][$targetSku] ?? [],
                'sp'                => $json['sp'][$targetSku]          ?? [],
                'listbehavior'      => $json['listbehavior'][$targetSku] ?? [],

                // Power Accessories (Battery/Charger) linked to Serial
                'power_accessories' => $json['power_accessories']  ?? [],
            ];

            Cache::put($cacheKey, $data, now()->addDay());
            return response()->json(['success' => true, 'data' => $data], 200);
        } catch (\Throwable $e) {
            Log::error('[historyDetail] Exception', [
                'serial_number' => $serial_number,
                'error'      => $e->getMessage(),
            ]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
        }
    }
    */

    //updated to use id because serial_number is not unique
    public function historyDetail($id)
    {
        try {
            // 1. ค้นหาข้อมูลจาก Database เพื่อดูว่า user กดดูรายการไหน และ SKU อะไร
            $historyItem = TblHistoryProd::find($id);

            if (!$historyItem) {
                return response()->json(['success' => false, 'message' => 'ไม่พบข้อมูลประวัติ'], 404);
            }

            $serial_number = $historyItem->serial_number;
            $current_sku = $historyItem->model_code; // SKU ของรายการที่กดดู (สำคัญมาก)

            // Cache Key ผูกกับ ID เพื่อความถูกต้อง
            $cacheKey = "war:detail:id:{$id}:sku:{$current_sku}";
            $cached = Cache::get($cacheKey);

            if ($cached !== null) {
                return response()->json(['success' => true, 'data' => $cached]);
            }

            $apiUrl = 'https://warranty-sn.pumpkin.tools/api/getdata';

            // Step 1: ค้นหาด้วย Serial Number ก่อน (เพื่อดูภาพรวม)
            $responseSN = Http::timeout(15)
                ->withOptions(['verify' => false])
                ->get($apiUrl, ['search' => $serial_number]);

            $mainData = [];
            $isAccessory = false;

            if ($responseSN->successful()) {
                $jsonSN = $responseSN->json();

                if (($jsonSN['status'] ?? '') === 'SUCCESS') {
                    // เช็คว่า SKU ใน Database ตรงกับ Main SKU ของ API หรือไม่
                    // ถ้าไม่ตรง ($current_sku != $jsonSN['skumain']) แสดงว่าเป็น Accessory (เช่น แบตเตอรี่)
                    if (isset($jsonSN['skumain']) && $current_sku != $jsonSN['skumain']) {
                        $isAccessory = true;
                    }
                    // กรณีไม่มี skumain ให้เช็คจาก assets key โดยตรง
                    elseif (!isset($jsonSN['assets'][$current_sku])) {
                        // ถ้าหา key SKU ใน assets ชุดแรกไม่เจอ ก็มีโอกาสเป็น Accessory
                        $isAccessory = true;
                    }

                    $mainData = $jsonSN;
                }
            }

            // Step 2: เลือกดึงข้อมูล Asset (ถ้าเป็น Accessory ให้ค้นด้วย SKU)
            $finalAsset = null;
            if ($isAccessory) {
                // Case: Accessory -> ค้นหา API อีกครั้งด้วย SKU
                $responseSku = Http::timeout(15)
                    ->withOptions(['verify' => false])
                    ->get($apiUrl, ['search' => $current_sku]);

                if ($responseSku->successful()) {
                    $jsonSku = $responseSku->json();
                    if (($jsonSku['status'] ?? '') === 'SUCCESS') {
                        $assets = $jsonSku['assets'] ?? [];
                        if (isset($assets[$current_sku])) {
                            $finalAsset = $assets[$current_sku];
                        }
                    }
                }
            } else {
                // Case: Main Product -> ใช้ข้อมูลจาก SN Response ได้เลย
                $assets = $mainData['assets'] ?? [];

                if (isset($assets[$current_sku])) {
                    $finalAsset = $assets[$current_sku];
                } elseif (!empty($assets)) {
                    // Fallback: เอาตัวแรก
                    $finalAsset = reset($assets);
                }
            }

            if (!$finalAsset) {
                // ถ้าหาไม่เจอจริงๆ ให้ส่งข้อมูลว่างกลับไป (Frontend จะแสดง default)
                return response()->json(['success' => true, 'data' => []], 200);
            }

            // Step 3: Map ข้อมูลส่งกลับ
            $imageUrl = '';
            if (!empty($finalAsset['imagesku']) && is_array($finalAsset['imagesku'])) {
                $imageUrl = $finalAsset['imagesku'][0] ?? '';
            } elseif (!empty($finalAsset['imagesku']) && is_string($finalAsset['imagesku'])) {
                $imageUrl = $finalAsset['imagesku'];
            }

            $data = [
                'pid'               => $finalAsset['pid'] ?? $current_sku,
                'pname'             => $finalAsset['pname'] ?? $historyItem->product_name,
                'fac_model'         => $finalAsset['facmodel'] ?? $historyItem->model_name,
                'image'             => $imageUrl,

                // ข้อมูลประกันที่ถูกต้องตาม SKU นั้นๆ
                'warrantyperiod'    => $finalAsset['warrantyperiod'] ?? null,
                'warrantycondition' => $finalAsset['warrantycondition'] ?? null,
                'warrantynote'      => $finalAsset['warrantynote'] ?? null,

                // ไม่จำเป็นต้องส่ง power_accessories กลับไปซ้อนอีก เพราะเราแยกแถวแล้ว
                'power_accessories' => [],
                'sp_warranty'       => [],
            ];

            Cache::put($cacheKey, $data, now()->addDay());
            return response()->json(['success' => true, 'data' => $data], 200);
        } catch (\Throwable $e) {
            Log::error('[historyDetail] Exception', [
                'id'    => $id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
        }
    }
}