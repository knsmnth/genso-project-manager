<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_work_logs', function (Blueprint $table) {
            $table->id();
            $table->string('group_title');
            $table->string('group_subtitle')->nullable();
            $table->string('work_order_number');
            $table->string('category')->nullable();
            $table->string('work_type')->nullable();
            $table->text('description')->nullable();
            $table->string('start_date')->nullable();
            $table->string('completion_date')->nullable();
            $table->string('assigned_lead')->nullable();
            $table->integer('personnel_count')->default(0);
            $table->json('assigned_personnel')->nullable();
            $table->integer('inspections_count')->default(0);
            $table->boolean('has_comments')->default(false);
            $table->boolean('is_on_hold')->default(false);
            $table->json('remarks_list')->nullable();
            $table->json('equipment_list')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_work_logs');
    }
};
