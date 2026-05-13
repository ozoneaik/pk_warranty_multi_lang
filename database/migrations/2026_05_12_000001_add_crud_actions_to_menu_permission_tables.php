<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('role_menu_permissions', function (Blueprint $table) {
            $table->boolean('can_read')->default(false)->after('admin_menu_id');
            $table->boolean('can_create')->default(false)->after('can_read');
            $table->boolean('can_update')->default(false)->after('can_create');
            $table->boolean('can_delete')->default(false)->after('can_update');
        });

        Schema::table('admin_menu_permissions', function (Blueprint $table) {
            $table->boolean('can_read')->default(false)->after('admin_menu_id');
            $table->boolean('can_create')->default(false)->after('can_read');
            $table->boolean('can_update')->default(false)->after('can_create');
            $table->boolean('can_delete')->default(false)->after('can_update');
        });

        // ให้สิทธิ์ครบทุก action กับทุก record ที่มีอยู่แล้ว
        // เพื่อไม่ให้ระบบเดิม break — admin สามารถปรับลดทีหลังได้
        DB::table('role_menu_permissions')->update([
            'can_read'   => true,
            'can_create' => true,
            'can_update' => true,
            'can_delete' => true,
        ]);

        DB::table('admin_menu_permissions')->update([
            'can_read'   => true,
            'can_create' => true,
            'can_update' => true,
            'can_delete' => true,
        ]);
    }

    public function down(): void
    {
        Schema::table('role_menu_permissions', function (Blueprint $table) {
            $table->dropColumn(['can_read', 'can_create', 'can_update', 'can_delete']);
        });

        Schema::table('admin_menu_permissions', function (Blueprint $table) {
            $table->dropColumn(['can_read', 'can_create', 'can_update', 'can_delete']);
        });
    }
};
