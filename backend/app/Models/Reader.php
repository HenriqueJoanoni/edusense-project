<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reader extends Model
{
    protected $table = 'readers';

    protected $fillable = [
        'code',
        'location'
    ];

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
