<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointRedeemCode extends Model
{
    use HasFactory;

    protected $connection = 'mysql_slip';
    protected $table = 'point_redeem_codes';

    protected $fillable = [
        'transaction_id',
        'line_id',
        'product_tier_id',
        'redeem_code',
        'status',
        'expired_at',
        'used_at',
    ];

    protected $casts = [
        'expired_at' => 'datetime',
        'used_at'    => 'datetime',
    ];

    /**
     * ความสัมพันธ์กับรายการสินค้า/คูปอง
     */
    public function product()
    {
        return $this->belongsTo(ProductTier::class, 'product_tier_id');
    }

    /**
     * ความสัมพันธ์กับรายการธุรกรรมแต้ม
     */
    public function transaction()
    {
        return $this->belongsTo(PointTransaction::class, 'transaction_id');
    }

    /**
     * Scope สำหรับเช็คโค้ดที่ยังใช้งานได้
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'active')
            ->where('expired_at', '>', now());
    }
}
