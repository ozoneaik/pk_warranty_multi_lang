<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class Reward extends Model
{
    //
    protected $connection = 'mysql_slip';
    protected $table = 'rewards';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'rewards_id',
        'reward_name',
        'reward_code',

        // Points per Tier
        'points_silver',
        'points_gold',
        'points_platinum',

        // Target Group
        'member_group',
        'birth_month',
        'member_type',
        'category',

        // Quota
        'quota_limit_total',
        'quota_limit_per_user',
        'quota_rules',

        // Details
        'image_url',
        'description',
        'qr_code_description',

        // Conditions (Booleans)
        'is_missions_only',
        'is_auto_timer',
        'is_stock_control',
        'is_thermal_printer',
        'is_big_commerce',

        // Settings & Delivery
        'delivery_type',       // enum: 'delivery', 'receive_at_store'
        'visibility_settings', // enum: 'admin', 'user', 'both'

        // Date & Status
        'start_date',
        'end_date',
        'is_active',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        // แปลงเป็น Boolean (True/False) อัตโนมัติ
        'is_missions_only' => 'boolean',
        'is_auto_timer' => 'boolean',
        'is_stock_control' => 'boolean',
        'is_thermal_printer' => 'boolean',
        'is_big_commerce' => 'boolean',
        'is_active' => 'boolean',

        // แปลงเป็น Carbon Date Object
        'start_date' => 'datetime',
        'end_date' => 'datetime',

        // แปลงเป็น Integer เพื่อความปลอดภัยในการคำนวณ
        'points_silver' => 'integer',
        'points_gold' => 'integer',
        'points_platinum' => 'integer',
        'quota_limit_total' => 'integer',
        'quota_limit_per_user' => 'integer',
        'quota_rules' => 'array',
    ];

    /**
     * ตัวอย่าง Helper Function: ดึงคะแนนตามชื่อ Tier แบบ Dynamic
     * การใช้งาน: $reward->getPointByTier('silver');
     */
    public function getPointByTier($tierName)
    {
        $field = 'points_' . strtolower($tierName);

        // เช็คว่ามีฟิลด์นี้จริงหรือไม่
        if (in_array($field, $this->fillable)) {
            return $this->{$field};
        }

        return 0; // หรือ default value ที่ต้องการ
    }
}
