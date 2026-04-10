<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Support\Facades\Http;

class AssignRichMenuToOldUsers extends Command
{
    protected $signature = 'line:assign-richmenu';
    protected $description = 'Assign specific Rich Menu to all existing users';

    public function handle()
    {
        $richMenuId = 'richmenu-b0bcd26a8e3430bf7375935b5ea98a3f';
        $accessToken = env('LINE_CHANNEL_ACCESS_TOKEN');

        if (empty($accessToken)) {
            $this->error("LINE_CHANNEL_ACCESS_TOKEN is missing in .env");
            return;
        }

        // ดึง User เก่าทั้งหมดมาทีละ 100 คนเพื่อไม่ให้เมมโมรี่เต็ม
        TblCustomerProd::whereNotNull('cust_uid')->chunk(100, function ($customers) use ($richMenuId, $accessToken) {

            $userIds = $customers->pluck('cust_uid')->toArray();

            // [แก้ไขตรงนี้] เปลี่ยน URL และย้าย richMenuId มาไว้ในข้อมูลที่ส่งไป (Payload)
            $response = Http::withToken($accessToken)
                ->post("https://api.line.me/v2/bot/richmenu/bulk/link", [
                    'richMenuId' => $richMenuId,
                    'userIds'    => $userIds
                ]);

            if ($response->successful()) {
                $this->info("Successfully assigned rich menu to " . count($userIds) . " users.");
            } else {
                $this->error("Failed chunk: " . $response->body());
            }
        });

        $this->info('Done!');
    }
}
