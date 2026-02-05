<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class Privilege extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'privileges';

    protected $fillable = [
        'privilege_name',
        'privilege_code',

        // Points
        'points_silver',
        'points_gold',
        'points_platinum',

        // Target Group
        'member_group',
        'birth_month',
        'member_type',

        // Quota
        'quota_rules',

        // Details
        'image_url',
        'description',
        'qr_code_description',

        // Conditions
        'is_auto_timer',
        'is_stock_control',
        'is_thermal_printer',
        'is_big_commerce',

        // Settings
        'delivery_type',
        'visibility_settings',

        // Date & Status
        'start_date',
        'end_date',
        'is_active',
        'created_by'
    ];

    protected $casts = [
        'is_auto_timer' => 'boolean',
        'is_stock_control' => 'boolean',
        'is_thermal_printer' => 'boolean',
        'is_big_commerce' => 'boolean',
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'points_silver' => 'integer',
        'points_gold' => 'integer',
        'points_platinum' => 'integer',
        'quota_rules' => 'array', // สำคัญ: แปลง JSON เป็น Array
    ];

    /**
     * Helper: ดึงคะแนนตาม Tier
     */
    public function getPointByTier($tierName)
    {
        $field = 'points_' . strtolower($tierName);
        return in_array($field, $this->fillable) ? $this->{$field} : 0;
    }
}
