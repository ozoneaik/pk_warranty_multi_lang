<?php

namespace App\Services;

use App\Models\MasterWaaranty\MembershipTier;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\MembershipTierHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TierService
{
    /**
     * คำนวณและอัปเดต Tier ของลูกค้า (รองรับทั้ง Upgrade และ Expire)
     *
     * @param TblCustomerProd $customer
     * @return TblCustomerProd
     */
    public function recalculate(TblCustomerProd $customer)
    {
        $point = (int) $customer->point;
        $now = Carbon::now();

        // 1. ดึง Tier ทั้งหมด เรียงจากแต้มมาก -> น้อย
        $tiers = MembershipTier::orderByDesc('min_point')->get();

        // 2. หา Tier เป้าหมายที่เหมาะสมกับคะแนนปัจจุบัน
        // (หาตัวแรกที่ min_point น้อยกว่าหรือเท่ากับคะแนนที่มี)
        $targetTierConfig = $tiers->first(function ($t) use ($point) {
            return $point >= $t->min_point;
        });

        // ถ้าไม่เจอ (เช่น คะแนนติดลบ หรือ config หาย) ให้ใช้ Tier ต่ำสุด
        if (!$targetTierConfig) {
            $targetTierConfig = $tiers->last();
        }

        // Tier ปัจจุบัน
        $currentTierKey = strtolower($customer->tier_key ?? 'silver');
        $expiredAt = $customer->tier_expired_at ? Carbon::parse($customer->tier_expired_at) : null;

        // Config ของ Tier ปัจจุบัน (เอาไว้เทียบ min_point เพื่อดูว่าเป็นการ Upgrade หรือไม่)
        $currentTierConfig = $tiers->firstWhere('key', $currentTierKey);

        $shouldUpdate = false;
        $reason = '';

        // --- CASE 1: หมดอายุ (Expiry Check) ---
        if (!$expiredAt || $now->greaterThan($expiredAt)) {
            // ถ้าหมดอายุ ให้ Force Update ตามคะแนนจริง ณ ปัจจุบันทันที (ไม่สนว่าจะลดหรือเพิ่ม)
            $shouldUpdate = true;
            $reason = 'expired';
        }
        // --- CASE 2: ยังไม่หมดอายุ แต่คะแนนถึงเกณฑ์เลื่อนขั้น (Upgrade Check) ---
        else if ($targetTierConfig && $currentTierConfig) {
            if ($targetTierConfig->min_point > $currentTierConfig->min_point) {
                // Upgrade: คะแนนถึง Tier ที่สูงกว่าเดิม
                $shouldUpdate = true;
                $reason = 'upgrade';
            }
        }

        // --- ทำการอัปเดตข้อมูล ---
        if ($shouldUpdate) {
            $newTierKey = strtolower($targetTierConfig->key);

            // คำนวณวันหมดอายุใหม่ (นับจากวันนี้ไปตามระยะเวลาของ Tier ใหม่)
            $durationYears = $targetTierConfig->duration_years ?? 2;
            $newExpiredAt = $now->copy()->addYears($durationYears);

            // เก็บค่าเก่าไว้ log
            $oldTierKey = $customer->tier_key;
            $oldExpiredAt = $customer->tier_expired_at;

            // Update Database
            $customer->update([
                'tier_key'        => $newTierKey,
                'tier_updated_at' => $now,
                'tier_expired_at' => $newExpiredAt,
            ]);
            $customer->refresh();

            Log::channel('tier')->info("🔄 Tier Updated: Customer {$customer->cust_uid}", [
                'old' => $oldTierKey,
                'new' => $newTierKey,
                'reason' => $reason,
                'point' => $point
            ]);

            // บันทึก History
            $this->logHistory($customer, $oldTierKey, $newTierKey, $reason, $point, $oldExpiredAt);
        }

        return $customer;
    }

    /**
     * บันทึกประวัติการเปลี่ยนแปลง Tier
     */
    private function logHistory($customer, $oldTier, $newTier, $reason, $point, $oldExpiredAt)
    {
        try {
            // พยายามหา User ID เพื่อเก็บลง History (ถ้ามี)
            $userId = null;
            if ($customer->cust_line) {
                $user = User::where('line_id', $customer->cust_line)->first();
                $userId = $user ? $user->id : null;
            }

            MembershipTierHistory::create([
                'user_id'       => $userId,
                'cust_line'     => $customer->cust_line,
                'cust_tel'      => $customer->cust_tel,
                'tier_old'      => $oldTier,
                'tier_new'      => $newTier,
                'point_at_time' => $point,
                'reason'        => $reason,
                // 'expired_at'    => $oldExpiredAt, // วันหมดอายุของรอบเก่า
                'expired_at'    => $oldExpiredAt ? Carbon::parse($oldExpiredAt) : null,
                'changed_at'    => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            Log::channel('tier')->error("❌ Failed to log tier history: " . $e->getMessage());
        }
    }
}
