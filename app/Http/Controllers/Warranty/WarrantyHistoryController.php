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
    
    // public function history()
    // {
    //     $histories = TblHistoryProd::query()
    //         ->where('lineid', Auth::user()->line_id)
    //         ->orderByDesc('id')
    //         ->get([
    //             'id',
    //             'serial_number',
    //             'model_code',
    //             'model_name',
    //             'product_name',
    //             'slip',
    //             'approval',
    //             'insurance_expire',
    //         ]);

    //     return Inertia::render('Warranty/WarrantyHistory', [
    //         'histories' => $histories->map(fn($item) => [
    //             'id' => $item->id,
    //             'serial_number' => $item->serial_number,
    //             'model_code' => $item->model_code,
    //             'model_name' => $item->model_name,
    //             'product_name' => $item->product_name,
    //             'slip' => $item->slip,
    //             'approval' => $item->approval,
    //             'insurance_expire' => $item->insurance_expire,
    //         ]),
    //     ]);
    // }

    // public function historyDetail($model_code)
    // {
    //     try {
    //         $cacheKey = "war:detail:v3:{$model_code}";

    //         $cached = Cache::get($cacheKey);
    //         if ($cached !== null) {
    //             return response()->json(['success' => true, 'data' => $cached]);
    //         }

    //         $apiUrl = 'https://warranty-sn.pumpkin.tools/api/getdata';
    //         $response = Http::timeout(15)
    //             ->withOptions(['verify' => false])
    //             ->get($apiUrl, [
    //                 'search' => $model_code,
    //             ]);

    //         if (!$response->successful()) {
    //             Log::warning('[historyDetail] API not successful', [
    //                 'model_code' => $model_code,
    //                 'status'     => $response->status(),
    //             ]);
    //             return response()->json(['success' => false, 'data' => []], 200);
    //         }

    //         $json = $response->json();

    //         // ตรวจสอบ Status จาก API ใหม่
    //         if (($json['status'] ?? '') !== 'SUCCESS') {
    //             return response()->json(['success' => false, 'data' => []], 200);
    //         }

    //         // --- Logic การหา Asset (สินค้า) จาก API ใหม่ ---
    //         $assets = $json['assets'] ?? [];
    //         $skuset = $json['skuset'] ?? [];

    //         $asset = null;
    //         $targetSku = null;

    //         // 1. ลองหาจาก model_code โดยตรง
    //         if (isset($assets[$model_code])) {
    //             $asset = $assets[$model_code];
    //             $targetSku = $model_code;
    //         }
    //         // 2. ลองหาจาก skumain
    //         elseif (isset($json['skumain']) && isset($assets[$json['skumain']])) {
    //             $asset = $assets[$json['skumain']];
    //             $targetSku = $json['skumain'];
    //         }
    //         // 3. ลองหาจากตัวแรกใน skuset
    //         elseif (!empty($skuset) && isset($assets[$skuset[0]])) {
    //             $asset = $assets[$skuset[0]];
    //             $targetSku = $skuset[0];
    //         }
    //         // 4. ถ้ายังไม่เจอ ให้เอาตัวแรกสุดใน assets
    //         elseif (!empty($assets)) {
    //             $targetSku = array_key_first($assets);
    //             $asset = $assets[$targetSku];
    //         }

    //         // ถ้าไม่มีข้อมูลสินค้า ให้ return empty
    //         if (!$asset) {
    //             return response()->json(['success' => true, 'data' => []], 200);
    //         }

    //         // --- Map ข้อมูลลง Structure เดิม ---
    //         $data = [
    //             'warrantyperiod'    => $asset['warrantyperiod']    ?? null,
    //             'warrantycondition' => $asset['warrantycondition'] ?? null,
    //             'warrantynote'      => $asset['warrantynote']      ?? null,

    //             // ข้อมูลเหล่านี้ใน API ใหม่อยู่ที่ Root โดยใช้ SKU เป็น Key
    //             'sp_warranty'       => $json['sp_warranty'][$targetSku] ?? [],
    //             'sp'                => $json['sp'][$targetSku]          ?? [],
    //             'listbehavior'      => $json['listbehavior'][$targetSku] ?? [],

    //             'power_accessories' => $json['power_accessories']  ?? [],
    //         ];

    //         Cache::put($cacheKey, $data, now()->addDay());
    //         return response()->json(['success' => true, 'data' => $data], 200);
    //     } catch (\Throwable $e) {
    //         Log::error('[historyDetail] Exception', [
    //             'model_code' => $model_code,
    //             'error'      => $e->getMessage(),
    //         ]);
    //         return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
    //     }
    // }

    public function history()
    {
        // ... existing code ...
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
}
