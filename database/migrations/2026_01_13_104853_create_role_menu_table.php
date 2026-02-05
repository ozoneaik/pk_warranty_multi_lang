<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('role_menu_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role'); // 'admin', 'user', หรือ role อื่นๆ
            $table->foreignId('admin_menu_id')->constrained('admin_menus')->onDelete('cascade');
            $table->unique(['role', 'admin_menu_id']); // ป้องกันข้อมูลซ้ำ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_menu');
    }
};
