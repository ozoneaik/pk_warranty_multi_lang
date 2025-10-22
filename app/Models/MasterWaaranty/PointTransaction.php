<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    //
    protected $connection = 'mysql_slip';
    protected $table = 'point_transactions';
    public $timestamps = false;

    protected $fillable = [
        'line_id',
        'transaction_type',
        'process_code',
        'reference_id',
        'pid',
        'pname',
        'product_type',
        'point_before',
        'point_tran',
        'point_after',
        'tier',
        'docdate',
        'docno',
        'trandate',
        'created_at',
        'expired_at',
    ];

    protected $casts = [
        'docdate'    => 'date',
        'trandate'   => 'date',
        'expired_at' => 'date',
        'created_at' => 'datetime',
    ];

    /**
     * ความสัมพันธ์กับลูกค้า
     */
    public function customer()
    {
        return $this->belongsTo(TblCustomerProd::class, 'line_id', 'cust_line');
    }

    public function process()
    {
        return $this->belongsTo(TypeProcessPoint::class, 'process_code', 'process_code');
    }

    /**
     * แปลงชนิดธุรกรรมให้อ่านง่าย
     */
    public function getTransactionLabelAttribute(): string
    {
        return match ($this->transaction_type) {
            'earn'   => 'สะสมแต้ม',
            'redeem' => 'แลกของรางวัล',
            'adjust' => 'ปรับแต้ม',
            default  => 'ไม่ระบุ',
        };
    }
}
