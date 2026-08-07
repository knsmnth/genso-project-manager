<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('asset_name');
            $table->string('space')->nullable();
            $table->text('scope')->nullable();
            $table->string('workgroup')->nullable();
            $table->string('status')->default('Pending');
            $table->string('priority')->default('Medium');
            $table->string('worktype')->nullable();
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->string('start_time')->nullable();
            $table->string('end_time')->nullable();
            $table->string('foreman')->nullable();
            $table->json('assigned')->nullable();
            $table->text('description')->nullable();
            $table->json('tasks')->nullable();
            $table->string('work_title')->nullable();
            $table->string('date_received')->nullable();
            $table->string('requester_name')->nullable();
            $table->string('requesting_office')->nullable();
            $table->string('room_no')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
