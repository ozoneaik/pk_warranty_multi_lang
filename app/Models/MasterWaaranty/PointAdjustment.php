<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class PointAdjustment extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'point_adjustments';

    protected $fillable = [
        'line_id',
        'adjust_by',
        'action',
        'amount',
        'remark',
        'evidence_image_url',
        'adjust_by_id',
    ];

    public function customer()
    {
        return $this->belongsTo(TblCustomerProd::class, 'line_id', 'cust_line');
    }
}
