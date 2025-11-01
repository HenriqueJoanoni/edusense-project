<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Attendance extends Model
{
    protected $table = 'attendances';

    public $timestamps = false;

    protected $fillable = [
        'student_id',
        'reader_id',
        'timestamp'
    ];

    protected $casts = [
        'timestamp' => 'datetime'
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function reader(): BelongsTo
    {
        return $this->belongsTo(Reader::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    /**
     * Scope to filter attendances within a date period
     *
     * @param Builder $query
     * @param string $startDate
     * @param string $endDate
     * @return Builder
     */
    public function scopeInPeriod(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereDate('timestamp', '>=', $startDate)
            ->whereDate('timestamp', '<=', $endDate);
    }

    /**
     * Scope to eager load all necessary relationships for reports
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeWithFullDetails(Builder $query): Builder
    {
        return $query->with([
            'student:id,student_name,registration,course_id',
            'student.course:id,course_name,course_identifier',
            'reader:id,code,location'
        ]);
    }

    /**
     * Scope for today's attendances
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('timestamp', today());
    }

    /**
     * Scope for this week's attendances
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeThisWeek(Builder $query): Builder
    {
        return $query->whereBetween('timestamp', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    /**
     * Scope for this month's attendances
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeThisMonth(Builder $query): Builder
    {
        return $query->whereMonth('timestamp', now()->month)
            ->whereYear('timestamp', now()->year);
    }

    /**
     * Scope to order by latest first
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeLatestFirst(Builder $query): Builder
    {
        return $query->orderBy('timestamp', 'desc');
    }

    /**
     * Scope for specific student attendances
     *
     * @param Builder $query
     * @param int $studentId
     * @return Builder
     */
    public function scopeOfStudent(Builder $query, int $studentId): Builder
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope for specific course attendances
     *
     * @param Builder $query
     * @param int $courseId
     * @return Builder
     */
    public function scopeOfCourse(Builder $query, int $courseId): Builder
    {
        return $query->whereHas('student', function ($q) use ($courseId) {
            $q->where('course_id', $courseId);
        });
    }

    // ==========================================
    // ACCESSORS
    // ==========================================

    /**
     * Get a formatted date
     *
     * @return string
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->timestamp->format('Y-m-d');
    }

    /**
     * Get formatted time
     *
     * @return string
     */
    public function getFormattedTimeAttribute(): string
    {
        return $this->timestamp->format('H:i:s');
    }
}
