<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    //
    protected $connection = 'mysql_slip';
    protected $table = 'banners';

    protected $fillable = [
        'title',
        'image_path',
        'sort_order',
        'is_active',
        'type'
    ];

    // แปลงค่าอัตโนมัติเมื่อดึงข้อมูลออกมาใช้งาน
    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
