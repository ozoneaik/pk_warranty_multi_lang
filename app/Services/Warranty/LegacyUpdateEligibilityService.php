<?php

namespace App\Services\Warranty;

use App\Models\LegacyUpdateLog;
use App\Models\MasterWaaranty\TblHistoryProd;

class LegacyUpdateEligibilityService
{
    public function isEnabled(): bool
    {
        return (bool) config('warranty.legacy_update.enabled', true);
    }

    /**
     * Resolve whether a history record is eligible for a legacy update.
     * Returns the source key (e.g. 'service_center') or null if not eligible.
     * Returns false if the feature is disabled.
     *
     * @throws \Exception if the serial is already registered and not eligible
     */
    public function resolve(TblHistoryProd $record): string|false|null
    {
        if (!$this->isEnabled()) {
            return false;
        }

        if ($record->warranty_from === 'Service Center') {
            return 'service_center';
        }

        if ($record->warranty_from === 'texus_bull') {
            return 'texus_bull';
        }

        if (empty($record->warranty_from) && $this->isPumpkinWebsiteSlip($record->slip ?? '')) {
            return 'pumpkin_website';
        }

        return null;
    }

    /**
     * Find all TblHistoryProd records for the given serial number that are eligible for update.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, TblHistoryProd>
     */
    public function findEligibleRecords(string $serialNumber): \Illuminate\Database\Eloquent\Collection
    {
        return TblHistoryProd::where('serial_number', $serialNumber)
            ->where(function ($q) {
                $q->where('warranty_from', 'Service Center')
                  ->orWhere('warranty_from', 'texus_bull')
                  ->orWhereNull('warranty_from')
                  ->orWhere('warranty_from', '');
            })
            ->get();
    }

    /**
     * Perform the legacy update: find eligible records and update them to warranty_pumpkin_crm.
     *
     * @param  array{lineid: string|null, cust_tel: string|null, buy_from: string, store_name: string, buy_date: string, pc_code: string|null, slip: string|null}  $data
     * @throws \Exception
     */
    public function performUpdate(string $serialNumber, array $data): int
    {
        $records = $this->findEligibleRecords($serialNumber);

        if ($records->isEmpty()) {
            throw new \Exception('ไม่พบข้อมูลที่ต้องการอัพเดท');
        }

        $updateData = [
            'warranty_from' => 'warranty_pumpkin_crm',
            'lineid'        => $data['lineid'] ?? null,
            'cust_tel'      => $data['cust_tel'] ?? null,
            'buy_from'      => $data['buy_from'],
            'store_name'    => $data['store_name'],
            'buy_date'      => $data['buy_date'],
            'pc_code'       => $data['pc_code'] ?? null,
            'approval'      => '',
            'approver'      => '',
            'dt_approve'    => null, 
            'notation'      => null,
        ];

        if (!empty($data['slip'])) {
            $updateData['slip'] = $data['slip'];
        }

        foreach ($records as $record) {
            $beforeSnapshot = $record->toArray();
            $sourceKey = $this->resolve($record) ?: 'unknown';

            $record->update($updateData);
            $record->refresh();

            LegacyUpdateLog::create([
                'serial_number'       => $serialNumber,
                'source_key'          => $sourceKey,
                'history_prod_id'     => $record->id,
                'before_data'         => $beforeSnapshot,
                'after_data'          => $record->toArray(),
                'triggered_by_lineid' => $data['lineid'] ?? null,
            ]);
        }

        \Illuminate\Support\Facades\Log::channel('warranty')->info('✅ [LegacyUpdate] อัพเดท legacy → warranty_pumpkin_crm สำเร็จ', [
            'serial_number' => $serialNumber,
            'count'         => $records->count(),
            'lineid'        => $data['lineid'] ?? null,
        ]);

        return $records->count();
    }

    private function isPumpkinWebsiteSlip(string $slip): bool
    {
        return str_contains($slip, 'slip.pumpkin.tools/uploads_warranty_online')
            || str_contains($slip, 'uploads-warranty-online.s3.ap-southeast-1.amazonaws.com')
            || str_contains($slip, 'localhost/storage/warranty_slip');
    }
}
