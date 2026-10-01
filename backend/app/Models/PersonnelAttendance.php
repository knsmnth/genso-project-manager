<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonnelAttendance extends Model
{
    use HasFactory;

    protected $table = 'personnel_attendance';
    protected $guarded = [];

    public function person()
    {
        return $this->belongsTo(Personnel::class, 'personnel_code', 'code');
    }
}
