<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class ReferralHistory extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'referral_histories';

    protected $fillable = [
        'referrer_uid',
        'referrer_name',
        'status_referrer',
        'points_referrer',
        'referee_uid',
        'referee_name',
        'status_referee',
        'points_referee',
        'process_code',
        'registered_at',
        'rewarded_at',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'rewarded_at'   => 'datetime',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
        'points_referrer' => 'integer',
        'points_referee'  => 'integer',
    ];

    /**
     * ความสัมพันธ์: เชื่อมกลับไปหาข้อมูลผู้เชิญ (Referrer)
     */
    public function referrer()
    {
        // เชื่อม referrer_uid ในตารางนี้ กับ cust_uid ในตาราง TblCustomerProd
        return $this->belongsTo(TblCustomerProd::class, 'referrer_uid', 'cust_uid');
    }

    /**
     * ความสัมพันธ์: เชื่อมกลับไปหาข้อมูลสมาชิกใหม่ (Referee)
     */
    public function referee()
    {
        // เชื่อม referee_uid ในตารางนี้ กับ cust_uid ในตาราง TblCustomerProd
        return $this->belongsTo(TblCustomerProd::class, 'referee_uid', 'cust_uid');
    }

    /**
     * ความสัมพันธ์: เชื่อมไปหาการตั้งค่าแต้มใน Master (TypeProcessPoint)
     */
    public function masterProcess()
    {
        return $this->belongsTo(TypeProcessPoint::class, 'process_code', 'process_code');
    }
}
