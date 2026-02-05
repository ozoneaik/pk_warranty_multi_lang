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
        Schema::create('admin_menus', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('icon_type'); // เช่น 'user', 'product', 'point'
            $table->string('route_name'); // เก็บชื่อ route เช่น admin.users.index
            $table->string('color_class'); // เก็บ bg-blue-50 เป็นต้น
            $table->string('icon_color');  // เก็บ text-blue-500 เป็นต้น
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_menus');
    }
};
