<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnel', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('role');
            $table->string('status')->default('Available');
            $table->string('attendance_status')->default('Absent');
            $table->string('active_order')->default('—');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel');
    }
};
