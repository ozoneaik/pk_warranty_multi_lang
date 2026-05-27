<?php

namespace App\Console\Commands;

use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Console\Command;

class SyncCustomerPoints extends Command
{
    protected $signature = 'points:sync
                            {line_id : Line ID ของลูกค้าที่ต้องการ sync}';

    protected $description = 'Sync คะแนนจาก point_transactions ไปยัง tbl_customer_prod';

    public function handle(): int
    {
        $lineId = $this->argument('line_id');

        $this->info("🔍 กำลังค้นหาลูกค้า: {$lineId}");

        $customer = TblCustomerProd::where('cust_line', $lineId)->first();

        if (!$customer) {
            $this->error("❌ ไม่พบลูกค้าที่มี Line ID: {$lineId}");
            return self::FAILURE;
        }

        $this->info("✅ พบลูกค้า: {$customer->cust_firstname} {$customer->cust_lastname}");

        $pointBefore = (int) $customer->point;
        $tierBefore  = $customer->tier_key;

        $this->info("📊 แต้มก่อน sync : {$pointBefore} | Tier: {$tierBefore}");
        $this->info("⏳ กำลัง sync...");

        $pointAfter = $customer->syncPoints();

        $customer->refresh();
        $tierAfter = $customer->tier_key;

        $this->info("✅ Sync เสร็จสิ้น!");
        $this->table(
            ['รายการ', 'ก่อน', 'หลัง'],
            [
                ['แต้ม', $pointBefore, $pointAfter],
                ['Tier', $tierBefore,  $tierAfter],
            ]
        );

        return self::SUCCESS;
    }
}
