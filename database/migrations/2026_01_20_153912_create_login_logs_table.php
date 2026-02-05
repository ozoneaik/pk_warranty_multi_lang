<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('login_logs', function (Blueprint $table) {
            $table->id();

            // 1. Who
            $table->unsignedBigInteger('user_id')->nullable()->comment('User ID ในระบบ');
            $table->string('line_id')->nullable()->comment('Line User ID');

            // 2. Context
            $table->string('ip_address', 45)->nullable()->comment('IPv4 หรือ IPv6');
            $table->text('user_agent')->nullable()->comment('Browser/Device info');

            // 3. Result & Meta
            $table->string('provider')->default('line')->comment('ช่องทาง Login (เผื่ออนาคตมี Facebook/Google)');
            $table->string('status', 20)->default('success')->comment('success, failed');
            $table->text('failure_reason')->nullable()->comment('เหตุผลกรณี Login ไม่สำเร็จ');
            $table->json('metadata')->nullable()->comment('เก็บข้อมูลอื่นๆ เช่น referrer_code');

            // 4. When
            $table->timestamp('login_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('login_logs');
    }
};
