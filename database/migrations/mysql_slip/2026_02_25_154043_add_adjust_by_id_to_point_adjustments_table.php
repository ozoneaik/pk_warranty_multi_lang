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
        // ต้องระบุ connection ให้ตรงกับตารางของคุณด้วย
        Schema::connection('mysql_slip')->table('point_adjustments', function (Blueprint $table) {
            
            // เพิ่มคอลัมน์ adjust_by_id ต่อจากคอลัมน์ adjust_by
            $table->unsignedBigInteger('adjust_by_id')->nullable()->after('adjust_by')->comment('ID แอดมินที่ทำรายการ');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql_slip')->table('point_adjustments', function (Blueprint $table) {
            
            // ลบคอลัมน์เมื่อมีการสั่ง rollback
            $table->dropColumn('adjust_by_id');
            
        });
    }
};
