<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class TblCustomerCheckins extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'tbl_customer_checkins';
    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'checkin_date',
        'checkin_at',
        'streak_count',
        'reward_point',
    ];

    protected $casts = [
        'checkin_date' => 'date', // แปลงเป็น Carbon object วันที่
        'checkin_at' => 'datetime',      // แปลงเป็น Carbon object เวลา
        'streak_count' => 'integer',
        'reward_point' => 'integer',
    ];

    /**
     * Relationship: เชื่อมกลับไปยังตารางข้อมูลลูกค้า
     * $checkin->customer จะได้ข้อมูลลูกค้าเจ้าของ check-in นี้
     */
    public function customer()
    {
        return $this->belongsTo(TblCustomerProd::class, 'customer_id', 'id');
    }
}
