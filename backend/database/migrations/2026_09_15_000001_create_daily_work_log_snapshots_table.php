<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_work_log_snapshots', function (Blueprint $table) {
            $table->id();
            $table->date('snapshot_date')->unique();
            $table->integer('total_orders')->default(0);
            $table->integer('total_tasks')->default(0);
            $table->integer('total_personnel')->default(0);
            $table->integer('total_equipment')->default(0);
            $table->integer('total_inspections')->default(0);
            $table->json('entries');
            $table->string('saved_by')->nullable();
            $table->boolean('is_auto_saved')->default(false);
            $table->string('content_hash')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_work_log_snapshots');
    }
};
