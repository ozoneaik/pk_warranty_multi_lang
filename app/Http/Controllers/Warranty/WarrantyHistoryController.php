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
    //         ->where('cust_tel', Auth::user()->phone)
    //         ->orderBy('id', 'desc')->get();
    //     return Inertia::render('Warranty/WarrantyHistory', [
    //         'histories' => $histories
    //     ]);
    // }

    /*public function history()
    {
        $histories = TblHistoryProd::query()
            ->where('cust_tel', Auth::user()->phone)
            ->orderBy('id', 'desc')
            ->get();

        Log::info('=== START Warranty History Processing ===', [
            'user_phone' => Auth::user()->phone,
            'total_histories' => $histories->count(),
        ]);

        foreach ($histories as $item) {
            try {
                Log::info('Processing item', [
                    'id' => $item->id,
                    'model_code' => $item->model_code,
                    'serial_number' => $item->serial_number,
                ]);

                $response = Http::timeout(15)
                    ->withOptions(['verify' => false])
                    ->post(env('VITE_SEARCH_SN'), [
                        'pid' => $item->model_code,
                        'views' => 'single',
                    ]);

                Log::info('API Response Status', [
                    'status' => $response->status(),
                    'successful' => $response->successful(),
                ]);

                if ($response->successful()) {
                    $responseBody = $response->body();

                    Log::info('Raw Response Body (first 500 chars)', [
                        'body_preview' => substr($responseBody, 0, 500),
                    ]);
                    $cleanBody = preg_replace('/<br\s*\/?>\s*<b>.*?<\/b>.*?<br\s*\/?>/s', '', $responseBody);
                    $cleanBody = preg_replace('/^.*?(\{.*\})$/s', '$1', $cleanBody);

                    Log::info('Cleaned Body (first 500 chars)', [
                        'cleaned_preview' => substr($cleanBody, 0, 500),
                    ]);

                    $json = json_decode($cleanBody, true);

                    if (json_last_error() !== JSON_ERROR_NONE) {
                        Log::error('JSON Decode Error', [
                            'error' => json_last_error_msg(),
                            'body_preview' => substr($cleanBody, 0, 1000),
                        ]);
                        continue;
                    }

                    Log::info('JSON Decoded Successfully', [
                        'status' => $json['status'] ?? 'null',
                        'has_assets' => isset($json['assets']),
                    ]);

                    if (is_array($json) && ($json['status'] ?? '') === 'SUCCESS') {
                        $assets = $json['assets'] ?? [];

                        if (!empty($assets) && is_array($assets)) {
                            if (array_is_list($assets)) {
                                $asset = $assets[0] ?? null;
                            } else {
                                $asset = reset($assets);
                            }

                            if ($asset) {
                                $item->warrantyperiod = $asset['warrantyperiod'] ?? null;
                                $item->warrantycondition = $asset['warrantycondition'] ?? null;
                                $item->warrantynote = $asset['warrantynote'] ?? null;
                                $item->sp_warranty = $asset['sp_warranty'] ?? [];
                                $item->sp = $asset['sp'] ?? [];
                                $item->listbehavior = $asset['listbehavior'] ?? [];

                                Log::info('Data Assigned Successfully', [
                                    'id' => $item->id,
                                    'warrantyperiod' => $item->warrantyperiod,
                                    'sp_warranty_count' => count($item->sp_warranty),
                                    'listbehavior_count' => count($item->listbehavior),
                                ]);
                            } else {
                                Log::warning('Asset is null after normalization', [
                                    'assets' => $assets,
                                ]);
                            }
                            if (!empty($item->insurance_expire)) {
                                $expire = Carbon::parse($item->insurance_expire);
                                $item->is_warranty_expired = $expire->isPast();
                                $item->warranty_status_text = $expire->isPast()
                                    ? 'หมดอายุการรับประกัน'
                                    : 'อยู่ในระยะประกัน';
                            } else {
                                $item->is_warranty_expired = null;
                                $item->warranty_status_text = 'ไม่พบข้อมูลวันหมดประกัน';
                            }
                        } else {
                            Log::warning('Assets array is empty or invalid', [
                                'assets' => $assets,
                            ]);
                        }
                    } else {
                        Log::warning('API response status not SUCCESS', [
                            'status' => $json['status'] ?? 'null',
                            'message' => $json['message'] ?? 'null',
                        ]);
                    }
                } else {
                    Log::warning('API Response Not Successful', [
                        'status' => $response->status(),
                        'body' => substr($response->body(), 0, 500),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Exception in Warranty History Processing', [
                    'serial_number' => $item->serial_number,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        Log::info('=== END Warranty History Processing ===', [
            'final_histories_count' => $histories->count(),
        ]);

        return Inertia::render('Warranty/WarrantyHistory', [
            'histories' => $histories->map(function ($item) {
                return [
                    'id' => $item->id,
                    'serial_number' => $item->serial_number,
                    'model_code' => $item->model_code,
                    'model_name' => $item->model_name,
                    'product_name' => $item->product_name,
                    'slip' => $item->slip,
                    'approval' => $item->approval,
                    'insurance_expire' => $item->insurance_expire,
                    'warranty_status_text' => $item->warranty_status_text,
                    'warrantyperiod' => $item->warrantyperiod ?? null,
                    'warrantycondition' => $item->warrantycondition ?? null,
                    'warrantynote' => $item->warrantynote ?? null,
                    'sp_warranty' => $item->sp_warranty ?? [],
                    'sp' => $item->sp ?? [],
                    'listbehavior' => $item->listbehavior ?? [],
                ];
            })->toArray(),
        ]);
    }*/

    public function history()
    {
        // $histories = TblHistoryProd::query()
        //     ->where('cust_tel', Auth::user()->phone)
        //     ->orderBy('id', 'desc')
        //     ->get(['id', 'serial_number', 'model_code', 'model_name', 'product_name', 'slip', 'approval', 'insurance_expire']);
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

    public function historyDetail($model_code)
    {
        try {
            $cacheKey = "war:detail:{$model_code}";
            $cached = Cache::get($cacheKey);
            if ($cached !== null) {
                return response()->json(['success' => true, 'data' => $cached]);
            }

            $response = Http::timeout(10)
                ->withOptions(['verify' => false])
                ->post(env('VITE_R_MAIN_PRODUCT'), [
                    'pid'   => $model_code,
                    'views' => 'single',
                ]);

            if (!$response->successful()) {
                Log::warning('[historyDetail] API not successful', [
                    'model_code' => $model_code,
                    'status'     => $response->status(),
                    'body'       => substr($response->body(), 0, 300),
                ]);
                return response()->json(['success' => false, 'data' => []], 200);
            }

            $raw = $response->body();
            $clean = preg_replace('/<br\s*\/?>\s*<b>.*?<\/b>.*?<br\s*\/?>/s', '', $raw);
            $clean = preg_replace('/^.*?(\{.*\})$/s', '$1', $clean);

            $json = json_decode($clean, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('[historyDetail] JSON decode error', [
                    'model_code' => $model_code,
                    'error'      => json_last_error_msg(),
                    'preview'    => substr($clean, 0, 300),
                ]);
                return response()->json(['success' => false, 'data' => []], 200);
            }

            if (($json['status'] ?? '') !== 'SUCCESS') {
                Log::warning('[historyDetail] API status != SUCCESS', [
                    'model_code' => $model_code,
                    'status'     => $json['status'] ?? null,
                    'message'    => $json['message'] ?? null,
                ]);
                return response()->json(['success' => false, 'data' => []], 200);
            }

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
            if (!$asset || !is_array($asset)) {
                $data = [
                    'warrantyperiod'    => null,
                    'warrantycondition' => null,
                    'warrantynote'      => null,
                    'sp_warranty'       => [],
                    'sp'                => [],
                    'listbehavior'      => [],
                ];
                Cache::put($cacheKey, $data, now()->addHours(6));
                return response()->json(['success' => true, 'data' => $data], 200);
            }

            Log::info('[historyDetail] 🟢 Asset data from API', [
                'model_code' => $model_code,
                'has_asset' => $asset !== null,
                'warrantyperiod' => $asset['warrantyperiod'] ?? null,
                'warrantycondition' => $asset['warrantycondition'] ?? null,
                'warrantynote' => $asset['warrantynote'] ?? null,
                'keys' => array_keys($asset ?? []),
            ]);
            
            $data = [
                'warrantyperiod'    => $asset['warrantyperiod']    ?? null,
                'warrantycondition' => $asset['warrantycondition'] ?? null,
                'warrantynote'      => $asset['warrantynote']      ?? null,
                'sp_warranty'       => $asset['sp_warranty']       ?? [],
                'sp'                => $asset['sp']                ?? [],
                'listbehavior'      => $asset['listbehavior']      ?? [],
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
}