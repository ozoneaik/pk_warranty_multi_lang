<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // แนะนำให้สร้างใน connection เดียวกันกับระบบ
        Schema::connection('mysql_slip')->create('point_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('line_id')->index();
            $table->string('adjust_by')->nullable()->comment('ชื่อแอดมินที่ทำรายการ');
            $table->enum('action', ['add', 'deduct']);
            $table->integer('amount');
            $table->string('remark')->nullable();
            $table->string('evidence_image_url')->nullable()->comment('URL รูปภาพหลักฐานจาก S3');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('mysql_slip')->dropIfExists('point_adjustments');
    }
};
