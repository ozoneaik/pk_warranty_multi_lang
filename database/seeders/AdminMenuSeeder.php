<?php

namespace Database\Seeders;

use App\Models\AdminMenu;
use Illuminate\Database\Seeder;

class AdminMenuSeeder extends Seeder
{
    public function run()
    {
        $menus = [
            [
                'title' => 'จัดการผู้ใช้',
                'description' => 'ดูรายชื่อ, แก้ไขบทบาท, หรือระงับการใช้งาน',
                'icon_type' => 'user',
                'route_name' => 'admin.users.index',
                'color_class' => 'bg-blue-50 hover:bg-blue-100',
                'icon_color' => 'text-blue-500',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'จัดการสินค้า',
                'description' => 'เพิ่ม, ลบ, แก้ไขรายการสินค้าในระบบ',
                'icon_type' => 'product',
                'route_name' => 'admin.products.index',
                'color_class' => 'bg-green-50 hover:bg-green-100',
                'icon_color' => 'text-green-500',
                'order' => 2,
                'is_active' => false,
            ],
            [
                'title' => 'ระบบสะสมแต้ม (Point)',
                'description' => 'จัดการเงื่อนไขการแจกแต้มและประวัติการแลก',
                'icon_type' => 'point',
                'route_name' => 'admin.points.index',
                'color_class' => 'bg-purple-50 hover:bg-purple-100',
                'icon_color' => 'text-purple-500',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'จัดการสิทธิ์',
                'description' => 'จัดการสิทธิ์การใช้งานระบบ',
                'icon_type' => 'role',
                'route_name' => 'admin.permissions.index',
                'color_class' => 'bg-orange-50 hover:bg-orange-100',
                'icon_color' => 'text-orange-500',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'title' => 'จัดการของรางวัล',
                'description' => 'สร้างของรางวัล เพิ่ม ลบ แก้ไขของรางวัลในระบบ',
                'icon_type' => 'reward',
                'route_name' => 'admin.rewards.index',
                'color_class' => 'bg-pink-50 hover:bg-pink-100',
                'icon_color' => 'text-pink-500',
                'order' => 6,
                'is_active' => true,
            ],
            [
                'title' => 'จัดการสิทธิพิเศษ',
                'description' => 'สร้างสิทธิพิเศษ เพิ่ม ลบ แก้ไขของรางวัลในระบบ',
                'icon_type' => 'reward',
                'route_name' => 'admin.privileges.index',
                'color_class' => 'bg-pink-50 hover:bg-pink-100',
                'icon_color' => 'text-pink-500',
                'order' => 7,
                'is_active' => true,
            ],
            [
                'title' => 'จัดการ popup',
                'description' => 'สร้าง เพิ่ม ลบ แก้ไข popup ในระบบ',
                'icon_type' => 'popup',
                'route_name' => 'admin.popups.index',
                'color_class' => 'bg-pink-50 hover:bg-pink-100',
                'icon_color' => 'text-pink-500',
                'order' => 7,
                'is_active' => true,
            ],
            [
                'title' => 'จัดการ Banner',
                'description' => 'จัดการรูปภาพสไลด์หน้าแรก',
                'icon_type' => 'image', // ตรวจสอบ icon ที่มีในระบบ
                'route_name' => 'admin.banners.index',
                'color_class' => 'bg-indigo-50 hover:bg-indigo-100',
                'icon_color' => 'text-indigo-500',
                'order' => 8,
                'is_active' => true,
            ],
        ];

        foreach ($menus as $menu) {
            AdminMenu::updateOrCreate(
                ['route_name' => $menu['route_name']],
                $menu
            );
        }

        // เมนูแม่ Report
        $reportParent = AdminMenu::updateOrCreate(
            ['route_name' => 'admin.reports.index'],
            [
                'title' => 'รายงาน',
                'description' => 'รวมรายงานสรุปผลต่างๆ ของระบบ',
                'icon_type' => 'report',
                'color_class' => 'bg-red-50 hover:bg-red-100',
                'icon_color' => 'text-red-500',
                'order' => 5,
                'parent_id' => null,
                'is_active' => true,
                'key' => 'reports',
            ]
        );
        $rewardParent = AdminMenu::updateOrCreate(
            ['route_name' => 'admin.reward-management.index'],
            [
                'title' => 'จัดการรางวัล',
                'description' => 'จัดการของรางวัลและสิทธิพิเศษ',
                'icon_type' => 'reward',
                'color_class' => 'bg-pink-50 hover:bg-pink-100',
                'icon_color' => 'text-pink-500',
                'order' => 6,
                'parent_id' => null,
                'is_active' => true,
                'key' => 'reward-management',

            ]
        );
        //==============================================================================
        // เมนูย่อย Report FGF
        AdminMenu::updateOrCreate(
            ['route_name' => 'admin.reports.fgf'],
            [
                'title' => 'รายงาน FGF',
                'description' => 'รายละเอียดและสถิติของ Report FGF',
                'icon_type' => 'sub_report',
                'color_class' => 'bg-gray-50 hover:bg-gray-100',
                'icon_color' => 'text-gray-500',
                'order' => 1,
                'parent_id' => $reportParent->id,
                'is_active' => true,
                'key' => 'reports.fgf',
            ]
        );
        AdminMenu::updateOrCreate(
            ['route_name' => 'admin.orders.index'],
            [
                'title' => 'รายงาน Order',
                'description' => 'รายละเอียดและสถิติของ Order',
                'icon_type' => 'sub_report',
                'color_class' => 'bg-gray-50 hover:bg-gray-100',
                'icon_color' => 'text-gray-500',
                'order' => 2,
                'parent_id' => $reportParent->id,
                'is_active' => true,
                'key' => 'reports.orders',
            ]
        );
        AdminMenu::updateOrCreate(
            ['route_name' => 'admin.reports.customers'],
            [
                'title' => 'รายงานลูกค้า',
                'description' => 'สถิติลุกค้าและการลงทะเบียน',
                'icon_type' => 'sub_report', // ตรวจสอบ icon ที่รองรับใน Front-end
                'color_class' => 'bg-gray-50 hover:bg-gray-100',
                'icon_color' => 'text-gray-500',
                'order' => 0, // ตั้งเป็น 0 เพื่อเป็นเมนูย่อยแรก
                'parent_id' => $reportParent->id,
                'is_active' => true,
                'key' => 'reports.customers',
            ]
        );
        //================================================================================
        // เมนูย่อย Reward
        AdminMenu::updateOrCreate(
            ['route_name' => 'admin.rewards.index'],
            [
                'title' => 'จัดการของรางวัล',
                'description' => 'สร้าง เพิ่ม ลบ แก้ไขของรางวัลในระบบ',
                'icon_type' => 'sub_reward',
                'color_class' => 'bg-gray-50 hover:bg-gray-100',
                'icon_color' => 'text-gray-500',
                'order' => 1,
                'parent_id' => $rewardParent->id,
                'is_active' => true,
                'key' => 'rewards'
            ]
        );
        // เมนูย่อย Privilege
        AdminMenu::updateOrCreate(
            ['route_name' => 'admin.privileges.index'],
            [
                'title' => 'จัดการสิทธิพิเศษ',
                'description' => 'สร้าง เพิ่ม ลบ แก้ไขสิทธิพิเศษในระบบ',
                'icon_type' => 'sub_reward',
                'color_class' => 'bg-gray-50 hover:bg-gray-100',
                'icon_color' => 'text-gray-500',
                'order' => 2,
                'parent_id' => $rewardParent->id,
                'is_active' => true,
                'key' => 'privileges'
            ]
        );
        AdminMenu::updateOrCreate(
            ['route_name' => 'admin.coupons.index'],
            [
                'title' => 'จัดการคูปอง',
                'description' => 'สร้าง เพิ่ม ลบ แก้ไขคูปองในระบบ',
                'icon_type' => 'sub_reward',
                'color_class' => 'bg-gray-50 hover:bg-gray-100',
                'icon_color' => 'text-gray-500',
                'order' => 3,
                'parent_id' => $rewardParent->id,
                'is_active' => true,
                'key' => 'coupons'
            ]
        );
    }
}
