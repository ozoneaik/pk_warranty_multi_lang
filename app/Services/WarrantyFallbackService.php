<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WarrantyFallbackService
{
    private string $channelPath = 'fallback/channels.json';
    private string $storePath   = 'fallback/stores.json';
    private string $logChannel  = 'warranty'; // ใช้ channel เดียวกับ Controller

    public function getChannels(): array
    {
        Log::channel($this->logChannel)->info('[Fallback] getChannels() เรียกใช้งาน');
        return $this->loadJson($this->channelPath, 'channels');
    }

    public function getStoresByChannelId(int|string $id): array
    {
        Log::channel($this->logChannel)->info('[Fallback] getStoresByChannelId() เรียกใช้งาน', [
            'id' => $id,
        ]);

        $all = $this->loadJson($this->storePath, "stores/{$id}");
        $result = $all[(string)$id] ?? [];

        Log::channel($this->logChannel)->info('[Fallback] getStoresByChannelId() ผลลัพธ์', [
            'id'    => $id,
            'count' => count($result),
            'found' => !empty($result),
        ]);

        return $result;
    }

    public function updateChannelCache(array $data): void
    {
        Log::channel($this->logChannel)->info('[Fallback] updateChannelCache() เริ่มอัปเดต', [
            'count' => count($data),
        ]);

        // เช็คข้อมูลเดิมก่อนเขียนทับ
        $existing = [];
        if (Storage::disk('local')->exists($this->channelPath)) {
            $raw = Storage::disk('local')->get($this->channelPath);
            $existing = json_decode($raw, true) ?? [];
        }

        $this->saveJson($this->channelPath, $data, 'channels');

        Log::channel($this->logChannel)->info('[Fallback] updateChannelCache() เสร็จสิ้น', [
            'count_before' => count($existing),
            'count_after'  => count($data),
            'changed'      => count($existing) !== count($data),
        ]);
    }

    public function updateStoreCache(int|string $id, array $data): void
    {
        Log::channel($this->logChannel)->info('[Fallback] updateStoreCache() เริ่มอัปเดต', [
            'id'    => $id,
            'count' => count($data),
        ]);

        $all = $this->loadJson($this->storePath, "stores/all");

        // เช็คข้อมูลเดิม
        $existingCount = count($all[(string)$id] ?? []);

        $all[(string)$id] = $data;
        $this->saveJson($this->storePath, $all, "stores/{$id}");

        Log::channel($this->logChannel)->info('[Fallback] updateStoreCache() เสร็จสิ้น', [
            'id'            => $id,
            'count_before'  => $existingCount,
            'count_after'   => count($data),
            'changed'       => $existingCount !== count($data),
            'total_channels_in_file' => count($all),
        ]);
    }

    // ─── Private Helpers ─────────────────────────────────────────────

    private function loadJson(string $path, string $label): array
    {
        Log::channel($this->logChannel)->debug('[Fallback] loadJson() เริ่มโหลด', [
            'path'  => $path,
            'label' => $label,
        ]);

        try {
            if (!Storage::disk('local')->exists($path)) {
                Log::channel($this->logChannel)->warning('[Fallback] ไม่พบไฟล์ fallback', [
                    'path'  => $path,
                    'label' => $label,
                ]);
                return [];
            }

            // ดึงข้อมูล meta ของไฟล์เพื่อ debug
            $lastModified = Storage::disk('local')->lastModified($path);
            $fileSize     = Storage::disk('local')->size($path);

            $content = Storage::disk('local')->get($path);
            $decoded = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
                Log::channel($this->logChannel)->error('[Fallback] JSON parse error', [
                    'path'       => $path,
                    'label'      => $label,
                    'json_error' => json_last_error_msg(),
                    'file_size'  => $fileSize,
                ]);
                return [];
            }

            Log::channel($this->logChannel)->info('[Fallback] loadJson() สำเร็จ', [
                'path'          => $path,
                'label'         => $label,
                'count'         => count($decoded),
                'file_size_kb'  => round($fileSize / 1024, 2),
                'last_modified' => date('Y-m-d H:i:s', $lastModified),
            ]);

            return $decoded;
        } catch (\Throwable $e) {
            Log::channel($this->logChannel)->error('[Fallback] loadJson() exception', [
                'path'  => $path,
                'label' => $label,
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ]);
            return [];
        }
    }

    private function saveJson(string $path, array $data, string $label): void
    {
        Log::channel($this->logChannel)->debug('[Fallback] saveJson() เริ่มบันทึก', [
            'path'  => $path,
            'label' => $label,
            'count' => count($data),
        ]);

        try {
            $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

            if ($json === false) {
                Log::channel($this->logChannel)->error('[Fallback] json_encode ล้มเหลว', [
                    'path'       => $path,
                    'label'      => $label,
                    'json_error' => json_last_error_msg(),
                ]);
                return;
            }

            Storage::disk('local')->put($path, $json);

            $fileSize = Storage::disk('local')->size($path);

            Log::channel($this->logChannel)->info('[Fallback] saveJson() สำเร็จ ✅', [
                'path'         => $path,
                'label'        => $label,
                'count'        => count($data),
                'file_size_kb' => round($fileSize / 1024, 2),
                'saved_at'     => now()->toDateTimeString(),
            ]);
        } catch (\Throwable $e) {
            Log::channel($this->logChannel)->error('[Fallback] saveJson() exception', [
                'path'  => $path,
                'label' => $label,
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ]);
        }
    }
}
