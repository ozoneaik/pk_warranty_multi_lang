<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
    {
        Schema::table('admins', function (Blueprint $blueprint) {
            // เพิ่มฟิลด์ updated_by ต่อท้ายฟิลด์ role (หรือตามตำแหน่งที่คุณต้องการ)
            // ใช้ unsignedBigInteger เพราะ id ปกติของ Laravel เป็นประเภทนี้
            $blueprint->unsignedBigInteger('updated_by')->nullable()->after('role');
            
            // หากต้องการทำ Foreign Key เชื่อมกับตารางตัวเอง (Optional)
            // $blueprint->foreign('updated_by')->references('id')->on('admins')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('admins', function (Blueprint $blueprint) {
            // ลบฟิลด์ออกเมื่อรัน rollback
            $blueprint->dropColumn('updated_by');
        });
    }
};
