<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mysql_slip';

    public function up(): void
    {
        Schema::connection('mysql_slip')->table('point_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('checkin_id')->nullable()->after('reference_id');
            $table->foreign('checkin_id')->references('id')->on('tbl_customer_checkins')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::connection('mysql_slip')->table('point_transactions', function (Blueprint $table) {
            $table->dropForeign(['checkin_id']);
            $table->dropColumn('checkin_id');
        });
    }
};
