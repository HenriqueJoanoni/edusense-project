<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassSubject extends Model
{
    protected $table = 'class_subjects';

    public $timestamps = false;

    protected $fillable = [
        'class_id',
        'subject_id',
        'lecturer_id'
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(CourseClasses::class, 'class_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(Lecturer::class);
    }
}
