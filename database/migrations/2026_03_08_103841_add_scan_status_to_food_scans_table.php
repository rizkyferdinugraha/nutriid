<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('food_scans', function (Blueprint $table) {
            $table->enum('scan_status', ['success', 'failed'])->default('success')->after('raw_response');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('food_scans', function (Blueprint $table) {
            $table->dropColumn('scan_status');
        });
    }
};
