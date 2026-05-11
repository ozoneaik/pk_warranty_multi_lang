<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegacyUpdateLog extends Model
{

    protected $connection = 'mysql_slip';
    public $timestamps = false;

    protected $fillable = [
        'serial_number',
        'source_key',
        'history_prod_id',
        'before_data',
        'after_data',
        'triggered_by_lineid',
    ];

    protected $casts = [
        'before_data' => 'array',
        'after_data'  => 'array',
        'created_at'  => 'datetime',
    ];
}
