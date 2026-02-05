<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupons extends Model
{
    use HasFactory;
    
    protected $connection = 'mysql_slip';
    protected $table = 'coupons';
    
    protected $fillable = [
        // Settings
        'name',
        'code',
        'is_auto_generate_code',
        'member_group',
        'birth_month',
        'quota_limit_total',
        'quota_limit_user',
        'member_type',

        // Toggles
        'is_link_traffic_source',
        'is_new_member_only',
        'is_auto_timer',
        'is_big_commerce',

        // Conditions
        'discount_value',
        'discount_unit',
        'min_order_amount',

        // Content
        'image_url',
        'description',

        // Duration
        'start_date',
        'end_date',
        'expiry_mode',
        'expiry_dynamic_value',
        'expiry_dynamic_unit',
        'is_expiry_notification',

        // Display
        'show_in_new_member_menu',

        // Channels
        'qr_code_description',
        'external_link',
        'redeemed_channels',

        // Status
        'is_active',

        'created_by',
    ];

    protected $casts = [
        'is_auto_generate_code' => 'boolean',
        'is_link_traffic_source' => 'boolean',
        'is_new_member_only' => 'boolean',
        'is_auto_timer' => 'boolean',
        'is_big_commerce' => 'boolean',
        'is_expiry_notification' => 'boolean',
        'show_in_new_member_menu' => 'boolean',
        'is_active' => 'boolean',

        // JSON Fields (เก็บเป็น LONGTEXT ใน DB แต่เรียกใช้เป็น Array)
        'member_group' => 'array',
        'redeemed_channels' => 'array',

        // Dates
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];
}
