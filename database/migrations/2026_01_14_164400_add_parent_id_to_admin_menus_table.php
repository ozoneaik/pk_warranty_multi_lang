<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('admin_menus', function (Blueprint $table) {
            // เพิ่ม parent_id ต่อท้าย id หรือคอลัมน์ที่ต้องการ
            // ใช้ nullable() เพราะเมนูหลักจะไม่มี parent
            // ใช้ constrained() เพื่อทำ Foreign Key อ้างอิงกลับไปที่ตารางตัวเอง (admin_menus)
            $table->foreignId('parent_id')
                ->after('id')
                ->nullable()
                ->constrained('admin_menus')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admin_menus', function (Blueprint $table) {
            // ลบ Foreign Key และคอลัมน์ parent_id ออกเมื่อ Rollback
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }
};
