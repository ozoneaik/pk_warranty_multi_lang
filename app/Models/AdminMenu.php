<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminMenu extends Model
{
    //
    protected $fillable = [
        'title',
        'description',
        'icon_type',
        'route_name',
        'color_class',
        'icon_color',
        'order',
        'is_active',
        'parent_id'
    ];

    public function index()
    {
        $menus = AdminMenu::active() // ใช้ scopeActive
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        return inertia('Admin/Dashboard', [
            'menus' => $menus,
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }


    public function children()
    {
        return $this->hasMany(AdminMenu::class, 'parent_id')
            ->where('is_active', true)
            ->orderBy('order');
    }

    public function parent()
    {
        // เมนูหนึ่งตัว มีเมนูแม่ได้หนึ่งตัว
        return $this->belongsTo(AdminMenu::class, 'parent_id');
    }
}
