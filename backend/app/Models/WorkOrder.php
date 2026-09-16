<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrder extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'assigned' => 'array',
        'tasks' => 'array',
        'item_types' => 'array',
        'is_locked' => 'boolean',
    ];
}
