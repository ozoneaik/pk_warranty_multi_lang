<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class TblHistoryProd extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'tbl_history_prod';

    protected $fillable = [
        'approval',
        'lineid',
        'cust_tel',
        'reward',
        'cust_tel',
        'serial_number',
        'model_code',
        'model_name',
        'product_name',
        'buy_from',
        'store_name',
        'buy_date',
        'slip',
        'approver',
        'round',
        'warranty_from',
        'customer_code',
        'customer_name'
    ];

    public $timestamps = false;
}