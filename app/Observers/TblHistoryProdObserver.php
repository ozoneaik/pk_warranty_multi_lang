<?php

namespace App\Observers;

use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TblHistoryProd;
use App\Models\MasterWaaranty\TypeProcessPoint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TblHistoryProdObserver
{
    public function updated(TblHistoryProd $history)
    {
        if ($history->isDirty('approval') && $history->approval === 'Y') {
            try {
                DB::beginTransaction();

                $cust = TblCustomerProd::where('cust_line', $history->lineid)->first();
                if (!$cust) {
                    Log::warning("⚠️ ไม่พบข้อมูลลูกค้า สำหรับ lineid {$history->lineid}");
                    return;
                }

                $tier = $cust->tier_key ?? 'silver';
                $process = TypeProcessPoint::where('process_code', 'WARRANTY_APPROVE')
                    ->where('is_active', 1)
                    ->first();

                if (!$process) {
                    Log::warning("⚠️ ไม่พบข้อมูล process WARRANTY_APPROVE");
                    return;
                }

                // ✅ คำนวณแต้มตาม Tier
                $earnPoint = match ($tier) {
                    'platinum' => $process->point_platinum ?? $process->default_point ?? 4,
                    'gold'     => $process->point_gold ?? $process->default_point ?? 2,
                    'silver'   => $process->point_silver ?? $process->default_point ?? 1,
                    default    => $process->default_point ?? 1,
                };

                $pointBefore = (int) $cust->point;
                $pointAfter  = $pointBefore + $earnPoint;

                // ✅ บันทึก Transaction
                PointTransaction::create([
                    'line_id'          => $cust->cust_line,
                    'transaction_type' => 'earn',
                    'process_code'     => 'WARRANTY_APPROVE',
                    'reference_id'     => $history->id,
                    'pid'              => $history->model_code,
                    'pname'            => $history->product_name,
                    'point_before'     => $pointBefore,
                    'point_tran'       => $earnPoint,
                    'point_after'      => $pointAfter,
                    'tier'             => $tier,
                    'docdate'          => now()->toDateString(),
                    'docno'            => sprintf('WAPP-%05d-%s', $cust->id ?? 0, now()->format('YmdHis')),
                    'trandate'         => now()->toDateString(),
                    'created_at'       => now(),
                    'expired_at'       => now()->addYears(2)->toDateString(),
                ]);

                // ✅ อัปเดตแต้มรวมลูกค้า
                $cust->update([
                    'point' => $pointAfter,
                    'last_earn_at' => now(),
                ]);

                DB::commit();

                Log::info("🎁 เพิ่มแต้ม Warranty Approved สำเร็จ", [
                    'cust' => $cust->cust_firstname,
                    'tier' => $tier,
                    'earn_point' => $earnPoint,
                    'total_point' => $pointAfter,
                ]);
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::error('❌ เพิ่มแต้ม Warranty Approved ไม่สำเร็จ', ['error' => $e->getMessage()]);
            }
        }
    }
}