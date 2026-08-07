<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyWorkLog extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'assigned_personnel' => 'array',
        'remarks_list' => 'array',
        'equipment_list' => 'array',
        'has_comments' => 'boolean',
        'is_on_hold' => 'boolean',
    ];
}
