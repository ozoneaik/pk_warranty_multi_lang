<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleMenuPermission extends Model
{
    protected $fillable = ['role', 'admin_menu_id'];

    public function menu()
    {
        return $this->belongsTo(AdminMenu::class, 'admin_menu_id');
    }
}
