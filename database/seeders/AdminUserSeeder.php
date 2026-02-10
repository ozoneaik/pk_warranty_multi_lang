<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // ตรวจสอบว่ามีอีเมลนี้หรือยัง ถ้ายังให้สร้างใหม่
        Admin::firstOrCreate(
            ['email' => 'admin@warranty.pumpkin.com'], // เงื่อนไขการเช็ค (ป้องกันซ้ำ)
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Pumpkin@1689'), // <--- รหัสผ่าน (ต้อง Hash)
                'phone' => '0812345678',
                'role' => 'super_admin', // <--- ต้องใส่ super_admin เพื่อให้เข้าเงื่อนไข getAllowedMenus()
                // 'status' => 'active',
            ]
        );

        // (Optional) แสดงข้อความใน Terminal ว่าเสร็จแล้ว
        $this->command->info('Admin created successfully.');
    }
}
