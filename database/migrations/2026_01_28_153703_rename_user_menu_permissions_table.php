<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. เปลี่ยนชื่อตาราง
        Schema::rename('user_menu_permissions', 'admin_menu_permissions');

        // 2. เปลี่ยนชื่อ Column ข้างใน (จาก user_id เป็น admin_id)
        Schema::table('admin_menu_permissions', function (Blueprint $table) {
            // ถ้ามี Foreign Key เดิมอยู่ ควร Drop ก่อน (ถ้าไม่มีข้ามบรรทัดนี้ได้)
            // $table->dropForeign(['user_id']); 

            $table->renameColumn('user_id', 'admin_id');

            // สร้าง Foreign Key ใหม่เชื่อมกับตาราง admins (Optional แต่แนะนำ)
            // $table->foreign('admin_id')->references('id')->on('admins')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        // ทำย้อนกลับกรณี Rollback
        Schema::table('admin_menu_permissions', function (Blueprint $table) {
            $table->renameColumn('admin_id', 'user_id');
        });

        Schema::rename('admin_menu_permissions', 'user_menu_permissions');
    }
};
