<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personnel extends Model
{
    use HasFactory;

    protected $table = 'personnel';
    protected $guarded = [];

    public function attendanceRecords()
    {
        return $this->hasMany(PersonnelAttendance::class, 'personnel_code', 'code');
    }

    public function leaves()
    {
        return $this->hasMany(PersonnelLeave::class, 'personnel_code', 'code');
    }
}
