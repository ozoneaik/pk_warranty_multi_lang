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
     * คืนค่าคะแนนรวมที่คำนวณจากประวัติธุรกรรมทั้งหมด
     */
    public function syncPoints()
    {
        $lineId = $this->cust_line;
        if (!$lineId) return 0;

        // ดึงแต้มรวมจากตารางธุรกรรม
        // Earn (+) / Adjust (+) → point_tran เป็นบวก
        // Redeem           → point_tran ถูกเก็บเป็น negative อยู่แล้ว (เช่น -3100)
        $earn = (int) PointTransaction::where('line_id', $lineId)
            ->whereIn('transaction_type', ['earn', 'adjust'])
            ->sum('point_tran');

        $redeem = (int) PointTransaction::where('line_id', $lineId)
            ->where('transaction_type', 'redeem')
            ->sum('point_tran'); // ค่าติดลบ เช่น -3100

        // ✅ ใช้ + เพราะ $redeem เป็นลบอยู่แล้ว
        // ❌ เดิมใช้ $earn - $redeem = earn - (ติดลบ) = บวกกัน → คะแนนพองตัวเกินจริง
        $totalPoints = max(0, $earn + $redeem);

        // 1. อัปเดตยอดแต้มลง DB ก่อนเพื่อให้ TierService นำไปใช้คำนวณต่อได้
        $this->update([
            'point' => $totalPoints,
        ]);

        // 2. ให้ TierService จัดการเรื่องระดับสมาชิก (Upgrade/Expire/History) ตามเงื่อนไขในไฟล์ TierService.php
        app(\App\Services\TierService::class)->recalculate($this);

        return $totalPoints;
    }
}
