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

    /*
    |--------------------------------------------------------------------------
    | Status / Approval Check
    |--------------------------------------------------------------------------
    | เปิด/ปิด การตรวจสอบฟิลด์ status และ approval ก่อนนับว่าซีเรียลลงทะเบียนแล้ว
    | ถ้าเปิด: serial ที่มี status=disabled/ว่าง หรือ approval≠Y จะลงทะเบียนซ้ำได้
    |
    | ตั้งค่าผ่าน .env: WARRANTY_STATUS_APPROVAL_CHECK_ENABLED=true
    */
    'status_approval_check' => [
        'enabled' => env('WARRANTY_STATUS_APPROVAL_CHECK_ENABLED', true),
    ],

];
