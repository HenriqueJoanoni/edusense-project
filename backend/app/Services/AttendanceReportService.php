<?php

namespace App\Services;

use App\Models\Attendance;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection as SupportCollection;

class AttendanceReportService
{
    /**
     * Generate attendance report data
     *
     * @param string $startDate
     * @param string $endDate
     * @param int|null $studentId
     * @param int|null $courseId
     * @return Collection
     */
    public function generateReportData(
        string $startDate,
        string $endDate,
        ?int   $studentId = null,
        ?int   $courseId = null
    ): Collection
    {
        $query = Attendance::query()
            ->inPeriod($startDate, $endDate)
            ->withFullDetails()
            ->latestFirst();

        if ($studentId) {
            $query->ofStudent($studentId);
        }

        if ($courseId) {
            $query->ofCourse($courseId);
        }

        return $query->get();
    }

    /**
     * Generate summary statistics
     *
     * @param Collection $attendances
     * @return array<string, mixed>
     */
    public function generateSummary(Collection $attendances): array
    {
        $totalRecords = $attendances->count();

        $uniqueStudents = $attendances->pluck('student_id')->unique()->count();

        $attendanceDays = $attendances->map(function ($attendance) {
            return $attendance->timestamp->format('Y-m-d');
        })->unique()->count();

        $averagePerDay = $attendanceDays > 0
            ? round($totalRecords / $attendanceDays, 2)
            : 0;

        return [
            'total_records' => $totalRecords,
            'unique_students' => $uniqueStudents,
            'attendance_days' => $attendanceDays,
            'average_per_day' => $averagePerDay,
        ];
    }

    /**
     * Get attendance statistics by course
     *
     * @param string $startDate
     * @param string $endDate
     * @return SupportCollection
     */
    public function getStatisticsByCourse(string $startDate, string $endDate): SupportCollection
    {
        return DB::table('attendances')
            ->join('students', 'attendances.student_id', '=', 'students.id')
            ->join('courses', 'students.course_id', '=', 'courses.id')
            ->whereBetween('attendances.timestamp', [$startDate, $endDate])
            ->select(
                'courses.id as course_id',
                'courses.course_name',
                'courses.course_identifier',
                DB::raw('COUNT(DISTINCT attendances.student_id) as total_students'),
                DB::raw('COUNT(attendances.id) as total_attendances')
            )
            ->groupBy('courses.id', 'courses.course_name', 'courses.course_identifier')
            ->get();
    }

    /**
     * Get daily attendance trend
     *
     * @param string $startDate
     * @param string $endDate
     * @return SupportCollection
     */
    public function getDailyTrend(string $startDate, string $endDate): SupportCollection
    {
        return DB::table('attendances')
            ->whereBetween('timestamp', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(timestamp) as date'),
                DB::raw('COUNT(*) as total_attendances'),
                DB::raw('COUNT(DISTINCT student_id) as unique_students')
            )
            ->groupBy(DB::raw('DATE(timestamp)'))
            ->orderBy('date')
            ->get();
    }
}
