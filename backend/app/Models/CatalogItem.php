<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogItem extends Model
{
    use HasFactory;

    protected $table = 'catalogs';
    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
        'quantity' => 'integer',
    ];
}
