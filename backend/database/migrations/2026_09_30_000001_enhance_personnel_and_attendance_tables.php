<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add extra profile fields to existing personnel table
        Schema::table('personnel', function (Blueprint $table) {
            if (!Schema::hasColumn('personnel', 'email')) {
                $table->string('email')->nullable()->after('name');
            }
            if (!Schema::hasColumn('personnel', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('personnel', 'department')) {
                $table->string('department')->nullable()->after('role');
            }
            if (!Schema::hasColumn('personnel', 'team')) {
                $table->string('team')->nullable()->after('department');
            }
            if (!Schema::hasColumn('personnel', 'date_hired')) {
                $table->string('date_hired')->nullable()->after('team');
            }
            if (!Schema::hasColumn('personnel', 'emergency_contact')) {
                $table->string('emergency_contact')->nullable()->after('date_hired');
            }
            if (!Schema::hasColumn('personnel', 'notes')) {
                $table->text('notes')->nullable()->after('active_order');
            }
        });

        // 2. Create personnel_attendance table
        if (!Schema::hasTable('personnel_attendance')) {
            Schema::create('personnel_attendance', function (Blueprint $table) {
                $table->id();
                $table->string('personnel_code')->index();
                $table->string('date')->index(); // YYYY-MM-DD
                $table->string('status')->default('present'); // present, absent, half_am, half_pm, on_leave
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->unique(['personnel_code', 'date']);
            });
        }

        // 3. Create personnel_leaves table
        if (!Schema::hasTable('personnel_leaves')) {
            Schema::create('personnel_leaves', function (Blueprint $table) {
                $table->id();
                $table->string('personnel_code')->index();
                $table->string('leave_type')->default('Vacation');
                $table->string('start_date'); // YYYY-MM-DD
                $table->string('end_date');   // YYYY-MM-DD
                $table->text('reason')->nullable();
                $table->string('status')->default('Approved');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel_leaves');
        Schema::dropIfExists('personnel_attendance');
        
        Schema::table('personnel', function (Blueprint $table) {
            $table->dropColumn([
                'email',
                'phone',
                'department',
                'team',
                'date_hired',
                'emergency_contact',
                'notes'
            ]);
        });
    }
};
