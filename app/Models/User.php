<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'line_id',
        'facebook_id',
        'phone',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // public function getAllowedMenus()
    // {
    //     // 1. ถ้าเป็น super_admin ให้ดึงเมนูหลักทั้งหมด พร้อมเมนูลูกของมัน
    //     if ($this->role === 'super_admin') {
    //         return \App\Models\AdminMenu::whereNull('parent_id') // เอาเฉพาะเมนูหลักก่อน
    //             ->with(['children' => function ($query) {
    //                 $query->orderBy('order'); // ดึงเมนูลูกพ่วงไปด้วย
    //             }])
    //             ->orderBy('order')
    //             ->get();
    //     }

    //     // 2. ดึง ID ของเมนูที่ได้รับอนุญาต (จากทั้ง Role และ Individual)
    //     $roleMenuIds = \Illuminate\Support\Facades\DB::table('role_menu_permissions')
    //         ->where('role', $this->role)
    //         ->pluck('admin_menu_id');

    //     $userMenuIds = \Illuminate\Support\Facades\DB::table('user_menu_permissions')
    //         ->where('user_id', $this->id)
    //         ->pluck('admin_menu_id');

    //     $allAllowedIds = $roleMenuIds->merge($userMenuIds)->unique()->toArray();

    //     // 3. ดึงเมนูเฉพาะที่มีสิทธิ์ โดยจัดโครงสร้าง Parent-Child
    //     return \App\Models\AdminMenu::whereNull('parent_id') // เริ่มจากเมนูหลัก
    //         ->whereIn('id', $allAllowedIds) // ต้องได้รับอนุญาตที่ตัวเมนูหลักเอง (หรือเมนูหลักไม่มีสิทธิ์แต่มีลูกที่มีสิทธิ์)
    //         ->with(['children' => function ($query) use ($allAllowedIds) {
    //             $query->whereIn('id', $allAllowedIds) // กรองเมนูลูกเฉพาะที่มีสิทธิ์เท่านั้น
    //                 ->orderBy('order');
    //         }])
    //         ->orderBy('order')
    //         ->get();
    // }
}
