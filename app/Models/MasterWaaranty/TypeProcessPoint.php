<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class TypeProcessPoint extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'type_process_points';

    protected $fillable = [
        'process_code',
        'process_name',
        'transaction_type',
        'default_point',
        'point_silver',
        'point_gold',
        'point_platinum',
        'description',
        'is_active',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function transactions()
    {
        return $this->hasMany(PointTransaction::class, 'process_code', 'process_code');
    }
}
