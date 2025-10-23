<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class MembershipTierHistory extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'membership_tier_histories';

    protected $fillable = [
        'user_id',
        'cust_line',
        'cust_tel',
        'tier_old',
        'tier_new',
        'expired_at',
        'changed_at',
        'reason',
        'point_at_time',
    ];

    protected $casts = [
        'expired_at' => 'datetime',
        'changed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * ความสัมพันธ์กับตาราง users
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function getTierNewLabelAttribute()
    {
        return ucfirst($this->tier_new ?? '');
    }

    public function getChangedAtFormattedAttribute()
    {
        return optional($this->changed_at)->format('d M Y H:i');
    }
}