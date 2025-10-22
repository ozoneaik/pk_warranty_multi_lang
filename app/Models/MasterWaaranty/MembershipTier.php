<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;
use illuminate\Database\Eloquent\Factories\HasFactory;

class MembershipTier extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'membership_tiers';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'key',
        'name',
        'level',
        'min_point',
        'duration_years',
        'description',
        'reward_rate'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * ความสัมพันธ์กับ ProductTier (สินค้าของ Tier นี้)
     */
    public function products()
    {
        return $this->hasMany(ProductTier::class, 'tier_level', 'level');
    }
}