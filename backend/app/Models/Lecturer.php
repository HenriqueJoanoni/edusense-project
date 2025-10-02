<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lecturer extends Model
{
    protected $table = 'lecturers';

    protected $fillable = [
        'lecturer_name',
        'lecturer_email',
        'user_id'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function classSubjects(): HasMany
    {
        return $this->hasMany(ClassSubject::class, 'lecturer_id');
    }
}
