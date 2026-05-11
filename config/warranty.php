<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Legacy Update Eligibility
    |--------------------------------------------------------------------------
    | เปิด/ปิด การอนุญาตให้ซีเรียลที่ลงทะเบียนจากระบบเก่า (Service Center,
    | Texus Bull, เว็บไซต์ Pumpkin) สามารถอัพเดทการลงทะเบียนใหม่ได้
    |
    | ตั้งค่าผ่าน .env: WARRANTY_LEGACY_UPDATE_ENABLED=true
    */
    'legacy_update' => [
        'enabled' => env('WARRANTY_LEGACY_UPDATE_ENABLED', true),
    ],

];
