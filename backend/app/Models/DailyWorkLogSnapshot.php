<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyWorkLogSnapshot extends Model
{
    use HasFactory;

    protected $table = 'daily_work_log_snapshots';

    protected $fillable = [
        'snapshot_date',
        'total_orders',
        'total_tasks',
        'total_personnel',
        'total_equipment',
        'total_inspections',
        'entries',
        'saved_by',
        'is_auto_saved',
        'content_hash',
    ];

    protected $casts = [
        'snapshot_date' => 'date:Y-m-d',
        'entries' => 'array',
        'is_auto_saved' => 'boolean',
        'total_orders' => 'integer',
        'total_tasks' => 'integer',
        'total_personnel' => 'integer',
        'total_equipment' => 'integer',
        'total_inspections' => 'integer',
    ];

    public function scopeForDate($query, $date)
    {
        return $query->where('snapshot_date', $date);
    }
}
