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
            // เพิ่มคอลัมน์ key หลังจาก title (หรือตำแหน่งที่ต้องการ)
            $table->string('key')->unique()->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('admin_menus', function (Blueprint $table) {
            $table->dropColumn('key');
        });
    }
};
