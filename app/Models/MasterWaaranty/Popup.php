<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class Popup extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'popups';
    //
    protected $fillable = [
        'title',
        'image_path',
        'is_active',
        'sort_order',
    ];

    // แปลงค่า is_active ให้เป็น true/false อัตโนมัติ (สะดวกตอนไปใช้ใน React)
    protected $casts = [
        'is_active' => 'boolean',
    ];
}
