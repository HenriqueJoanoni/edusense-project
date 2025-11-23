<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $table = 'students';
    public $timestamps = false;

    protected $fillable = [
        'student_name',
        'registration',
        'rfid_code',
        'qr_code',
        'course_id',
        'user_id'
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(CourseClasses::class, 'class_students', 'student_id', 'class_id');
    }

}
