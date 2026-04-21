<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dealer extends Model
{
    use HasFactory;
    protected $connection = 'mysql_slip';
    protected $table = 'dealers';

    protected $fillable = [
        'channel_id',
        'CustID',
        'name',
        'branch',
        'is_active',
    ];

    // บังคับ Type ให้ is_active เป็น boolean
    protected $casts = [
        'is_active' => 'boolean',
    ];
}
