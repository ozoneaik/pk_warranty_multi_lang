<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class RedeemHistory extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'redeem_histories';

    public $timestamps = false;
    protected $fillable = [
        'line_id',
        'pid',
        'pname',
        'redeem_point',
        'point_before',
        'point_after',
        'tier_at_tine',
        'redeemed_at',
    ];

    protected $casts = [
        'redeemed_at' => 'datetime',
    ];

    /**
     * ความสัมพันธ์กับลูกค้า (TblCustomerProd)
     */
    public function customer()
    {
        return $this->belongsTo(TblCustomerProd::class, 'line_id', 'cust_line');
    }
}
