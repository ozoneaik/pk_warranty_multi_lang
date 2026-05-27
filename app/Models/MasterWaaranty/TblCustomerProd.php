<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class TblCustomerProd extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'tbl_customer_prod';
    protected $fillable = [

        // พื้นฐานลูกค้า
        'cust_tel',
        'cust_prefix',
        'cust_firstname',
        'cust_lastname',
        'cust_gender',
        'cust_email',
        'cust_line',
        'cust_birthdate',

        // ที่อยู่
        'cust_full_address',
        'cust_address',
        'cust_subdistrict',
        'cust_district',
        'cust_province',
        'cust_zipcode',

        // อื่น ๆ
        'cust_mechanic',
        'cust_business',
        'cust_code',
        'cust_uid',

        'referral_code',
        'referred_by',
        
        // การยินยอม/การตลาด
        'accept_news',
        'accept_policy',
        'accept_pdpa',
        'accept_analyze_prod',
        'accept_marketing',
        'accepted_pdpa_at',
        'accepted_analyze_prod_at',
        'accepted_marketing_at',

        // ระบบ
        'unlockkey',
        'cre_key',
        'datetime',
        'status',
        'cust_type',

        'point_rocket',
        'point',

        'tier_key',
        'tier_updated_at',
        'tier_expired_at',
        'tier_locked',
        'last_redeem_at',
        'last_earn_at',
        'remark',

        'crm_user_type_id',
    ];
    public $timestamps = false;

    public function crmUserType()
    {
        return $this->belongsTo(CrmUserType::class, 'crm_user_type_id', 'id');
    }

    /**
     * คำนวณคะแนนสะสมโดยเรียง transaction ตาม created_at (เวลาที่เกิดจริง)
     * แล้ว running balance ทีละ step พร้อม cap ที่ 0 หลังทุก transaction
     *
     * กฎพิเศษ: process_code ที่ห้ามนับซ้ำ → นับเฉพาะ transaction แรกสุด (created_at เก่าสุด)
     *   - REGISTER: สมัครสมาชิกได้แต้มครั้งเดียว
     *
     * ตัวอย่าง (user มี REGISTER 3 อัน):
     *   2024-05-16  CHECKIN   +0   → 0
     *   2025-04-04  REGISTER  +50  → 50   ← นับ (อันแรก)
     *   2025-10-22  REGISTER  skip → 50   ← ข้าม (ซ้ำ)
     *   2025-10-22  REDEEM   -3100 → 0
     *   2025-12-10  REGISTER  skip → 0    ← ข้าม (ซ้ำ)
     *   2026-02-24  CHECKIN   +1   → 1
     *   2026-03-02  CHECKIN   +1   → 2    ← ยอดสุดท้าย
     */
    public function syncPoints(): int
    {
        $lineId = $this->cust_line;
        if (!$lineId) return 0;

        // process_code ที่อนุญาตให้ได้แต้มได้ครั้งเดียวเท่านั้น
        $onceOnlyCodes = ['REGISTER'];

        // ดึงทุก transaction เรียงตามเวลาที่เกิดขึ้นจริง (created_at ASC)
        // รองรับ transaction ที่ถูก insert ย้อนหลัง (backdated)
        $transactions = PointTransaction::where('line_id', $lineId)
            ->orderBy('created_at', 'asc')
            ->get(['transaction_type', 'process_code', 'point_tran']);

        $balance  = 0;
        $seenCode = []; // บันทึก process_code ที่นับไปแล้ว (สำหรับ once-only)

        foreach ($transactions as $txn) {
            $code = $txn->process_code;

            // ถ้าเป็น process_code ที่ห้ามซ้ำ และเคยนับไปแล้ว → ข้าม
            if (in_array($code, $onceOnlyCodes) && isset($seenCode[$code])) {
                continue;
            }

            // บันทึกว่านับ process_code นี้แล้ว
            if (in_array($code, $onceOnlyCodes)) {
                $seenCode[$code] = true;
            }

            $balance += (int) $txn->point_tran;
            $balance  = max(0, $balance);
        }

        // 1. อัปเดตยอดแต้มลง DB ก่อนเพื่อให้ TierService นำไปใช้คำนวณต่อได้
        $this->update(['point' => $balance]);

        // 2. ให้ TierService จัดการเรื่องระดับสมาชิก (Upgrade/Expire/History)
        app(\App\Services\TierService::class)->recalculate($this);

        return $balance;
    }
}
