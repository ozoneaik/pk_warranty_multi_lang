<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_menu_permissions', function (Blueprint $table) {
            // 1. ลบ Foreign Key ตัวเก่าออก (ชื่อตามที่ฟ้องใน Error)
            $table->dropForeign('user_menu_permissions_user_id_foreign');

            // 2. สร้าง Foreign Key ใหม่ให้ชี้ไปที่ตาราง admins
            $table->foreign('admin_id')
                ->references('id')
                ->on('admins') // เปลี่ยนจุดอ้างอิงเป็นตาราง admins
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('admin_menu_permissions', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->foreign('admin_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }
};
