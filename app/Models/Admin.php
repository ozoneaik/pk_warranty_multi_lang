<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

class Admin extends Authenticatable
{
    //
    use HasFactory, Notifiable;

    /**
     * ระบุตารางที่ใช้ (Optional: Laravel จะหา table 'admins' ให้เอง แต่ระบุไว้ก็ชัดเจนดี)
     */
    protected $table = 'admins';

    protected $guard = 'admin';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * ฟังก์ชันดึงเมนูสำหรับ Admin
     */
    // public function getAllowedMenus()
    // {
    //     // 1. ถ้าเป็น super_admin ให้ดึงเมนูหลักทั้งหมด พร้อมเมนูลูกของมัน
    //     if ($this->role === 'super_admin') {
    //         return AdminMenu::whereNull('parent_id') // เอาเฉพาะเมนูหลักก่อน
    //             ->with(['children' => function ($query) {
    //                 $query->orderBy('order'); // ดึงเมนูลูกพ่วงไปด้วย
    //             }])
    //             ->orderBy('order')
    //             ->get();
    //     }

    //     // 2. ดึง ID ของเมนูที่ได้รับอนุญาต (จากทั้ง Role และ Individual)

    //     // 2.1 สิทธิ์จาก Role (เหมือนเดิม)
    //     $roleMenuIds = DB::table('role_menu_permissions')
    //         ->where('role', $this->role)
    //         ->pluck('admin_menu_id');

    //     // 2.2 สิทธิ์รายบุคคล (ต้องระวังจุดนี้! ถ้าแยกตาราง admin แล้ว ควรเปลี่ยนตาราง permission ด้วย)
    //     // สมมติว่าคุณสร้างตารางใหม่ชื่อ 'admin_menu_permissions' หรือใช้ตารางเดิมแต่เปลี่ยน column เป็น admin_id
    //     $userMenuIds = DB::table('admin_menu_permissions')
    //         ->where('admin_id', $this->id) // ใช้ admin_id และ $this->id คือ id ของ admin คนนี้
    //         ->pluck('admin_menu_id');

    //     // รวม ID ทั้งหมดและลบตัวซ้ำ
    //     $allAllowedIds = $roleMenuIds->merge($userMenuIds)->unique()->toArray();

    //     // 3. ดึงเมนูเฉพาะที่มีสิทธิ์ โดยจัดโครงสร้าง Parent-Child
    //     return AdminMenu::whereNull('parent_id') // เริ่มจากเมนูหลัก
    //         ->whereIn('id', $allAllowedIds) // ต้องได้รับอนุญาตที่ตัวเมนูหลักเอง
    //         ->with(['children' => function ($query) use ($allAllowedIds) {
    //             $query->whereIn('id', $allAllowedIds) // กรองเมนูลูกเฉพาะที่มีสิทธิ์เท่านั้น
    //                 ->orderBy('order');
    //         }])
    //         ->orderBy('order')
    //         ->get();
    // }

    // public function getAllowedMenus()
    // {
    //     // 1. ถ้าเป็น super_admin ดึงเมนูทั้งหมดที่ active
    //     if ($this->role === 'super_admin') {
    //         return AdminMenu::where('is_active', true)
    //             ->orderBy('order')
    //             ->get(); // ดึงแบบแบนๆ ไม่ต้องใช้ with('children')
    //     }

    //     // 2. ดึง ID ของเมนูที่ได้รับอนุญาต
    //     $roleMenuIds = DB::table('role_menu_permissions')
    //         ->where('role', $this->role)
    //         ->pluck('admin_menu_id');

    //     $userMenuIds = DB::table('admin_menu_permissions')
    //         ->where('admin_id', $this->id)
    //         ->pluck('admin_menu_id');

    //     $allAllowedIds = $roleMenuIds->merge($userMenuIds)->unique()->toArray();

    //     // 3. ดึงทุกเมนู (ทั้งพ่อและลูก) ที่อยู่ในรายการที่มีสิทธิ์
    //     return AdminMenu::whereIn('id', $allAllowedIds)
    //         ->where('is_active', true)
    //         ->orderBy('order')
    //         ->get(); // ดึงแบบแบนๆ ทั้งหมด
    // }

    public function getAllowedMenus()
    {
        // 1. ถ้าเป็น super_admin ดึงเมนูทั้งหมดที่ active
        if ($this->role === 'super_admin') {
            return \App\Models\AdminMenu::where('is_active', true)
                ->orderBy('order')
                ->get();
        }

        // 2. ดึง ID ของเมนูที่ได้รับอนุญาต (จาก Roles และรายบุคคล)
        $roleMenuIds = DB::table('role_menu_permissions')
            ->where('role', $this->role)
            ->pluck('admin_menu_id');

        $userMenuIds = DB::table('admin_menu_permissions')
            ->where('admin_id', $this->id)
            ->pluck('admin_menu_id');

        // รวม ID ของเมนูลูกและแม่ที่ได้รับสิทธิ์ตรงๆ
        $allAllowedIds = $roleMenuIds->merge($userMenuIds)->unique()->toArray();

        // 3. หา Parent ID ของเมนูที่ได้รับอนุญาต เพื่อให้เมนูแม่ (Folder) แสดงผลด้วย
        $parentIds = \App\Models\AdminMenu::whereIn('id', $allAllowedIds)
            ->whereNotNull('parent_id')
            ->pluck('parent_id')
            ->unique()
            ->toArray();

        // รวม ID ทั้งหมด (เมนูที่อนุญาต + เมนูแม่ของมัน)
        $finalMenuIds = array_unique(array_merge($allAllowedIds, $parentIds));

        // 4. ดึงทุกเมนู (ทั้งพ่อและลูก) ที่อยู่ในรายการที่มีสิทธิ์
        return \App\Models\AdminMenu::whereIn('id', $finalMenuIds)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\Admin::class, 'created_by');
    }
}
