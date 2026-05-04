<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql_slip')->create('channels', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::connection('mysql_slip')->table('channels')->insert([
            ['id' => 1, 'name' => 'ตัวแทนจำหน่าย',    'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'PUMPKIN CORNER',    'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'ร้านค้าออนไลน์',    'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'ไทวัสดุ',           'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Homepro',           'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Mega home',         'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'name' => 'Dohome',            'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'name' => 'Global house',      'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'name' => 'ฮาร์ดแวร์เฮาส์',   'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::connection('mysql_slip')->dropIfExists('channels');
    }
};
