<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ต้องเช็คข้างนอก Schema::table สำหรับความชัวร์ในบางเคส
        if (Schema::hasColumn('admins', 'created_by')) {
            Schema::table('admins', function (Blueprint $table) {
                $table->dropColumn('created_by');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('admins', 'created_by')) {
            Schema::table('admins', function (Blueprint $table) {
                $table->unsignedBigInteger('created_by')->nullable()->after('role');
            });
        }
    }
};
