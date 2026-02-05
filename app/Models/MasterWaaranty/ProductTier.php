<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductTier extends Model
{
    use HasFactory;
    protected $connection = 'mysql_slip';
    protected $table = 'product_tiers';
    protected $fillable = [
        'pid',
        'pname',
        'discount_amount',
        'point_value_rate',
        'image_url',
        'tier_level',
        'product_type',
        'type_ref',
        'redeem_point',
        'is_active',
        'stock_qty',
        'expired_at',
        'earn_point',
        'expiry_type',
        'expiry_days',
        'usage_limit_type',
        'usage_limit_amount',
        'remark',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    /**
     * ความสัมพันธ์กับ Tier ที่สินค้าอยู่
     */
    public function tier()
    {
        return $this->belongsTo(MembershipTier::class, 'tier_level', 'level');
    }

    public function pointProcess()
    {
        return $this->belongsTo(TypeProcessPoint::class, 'type_ref', 'id');
    }

    /**
     * Scope ดึงสินค้าที่ผู้ใช้มองเห็นได้ (<= tier ปัจจุบัน)
     */
    public function scopeVisibleFor($query, int $userTierLevel)
    {
        return $query->where('tier_level', '<=', $userTierLevel);
    }

    public function getProductTypeLabelAttribute(): string
    {
        return match ($this->product_type) {
            'reward'    => 'รางวัล',
            'privilege' => 'สิทธิพิเศษ',
            'coupon'    => 'คูปอง',
            default     => '-',
        };
    }
}
