<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // ถ้าใช้ connection อื่นที่ไม่ใช่ default ให้ระบุตรงนี้
    protected $connection = 'mysql_slip'; 
    protected $table = 'orders';

    protected $fillable = [
        'order_number',
        'line_id',
        'transaction_id',

        // Customer Info
        'customer_name',
        'phone_number',
        'address',
        'sub_district',
        'district',
        'province',
        'zipcode',

        // Product Info
        'product_name',
        'product_code',
        'quantity',
        'points_redeemed',

        // Status
        'status',
        'tracking_number',
        'courier_name',
    ];

    /**
     * ความสัมพันธ์กับ PointTransaction (Optional)
     * เพื่อให้สามารถดึงข้อมูล Transaction กลับมาดูได้ง่ายๆ
     */
    public function transaction()
    {
        // ต้องตรวจสอบ namespace ของ PointTransaction ให้ถูกต้อง
        return $this->belongsTo(\App\Models\MasterWaaranty\PointTransaction::class, 'transaction_id');
    }
}
