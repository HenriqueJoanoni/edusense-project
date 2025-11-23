<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Course extends Model
{
    protected $table = 'courses';
    public $timestamps = false;

    protected $fillable = [
        'course_name',
        'course_identifier'
    ];

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function classes(): HasMany
    {
        return $this->hasMany(CourseClasses::class, 'course_id');
    }

    public function attendances(): HasManyThrough
    {
        return $this->hasManyThrough(Attendance::class, Student::class);
    }
}
