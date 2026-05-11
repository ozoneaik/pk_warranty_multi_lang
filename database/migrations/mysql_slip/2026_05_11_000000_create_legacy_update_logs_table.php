<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql_slip')->create('legacy_update_logs', function (Blueprint $table) {
            $table->id();
            $table->string('serial_number', 100)->index();
            $table->string('source_key', 50)->comment('service_center | texus_bull | pumpkin_website');
            $table->unsignedBigInteger('history_prod_id')->nullable()->comment('tbl_history_prod.id');
            $table->json('before_data');
            $table->json('after_data');
            $table->string('triggered_by_lineid', 100)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::connection('mysql_slip')->dropIfExists('legacy_update_logs');
    }
};
