<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalogs', function (Blueprint $table) {
            if (!Schema::hasColumn('catalogs', 'owner')) {
                $table->string('owner')->nullable()->after('location');
            }
            if (!Schema::hasColumn('catalogs', 'purchased')) {
                $table->string('purchased')->nullable()->after('owner');
            }
        });
    }

    public function down(): void
    {
        Schema::table('catalogs', function (Blueprint $table) {
            if (Schema::hasColumn('catalogs', 'purchased')) {
                $table->dropColumn('purchased');
            }
            if (Schema::hasColumn('catalogs', 'owner')) {
                $table->dropColumn('owner');
            }
        });
    }
};
