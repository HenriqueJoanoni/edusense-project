<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Reader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview statistics
     *
     * @return JsonResponse
     */
    public function getOverview(): JsonResponse
    {
        try {
            $stats = [
                'users' => [
                    'total' => User::count(),
                    'students' => User::where('user_role', 'student')->count(),
                    'lecturers' => User::where('user_role', 'lecturer')->count(),
                    'admins' => User::where('user_role', 'admin')->count(),
                    'recent' => User::where('created_at', '>=', Carbon::now()->subDays(30))->count(),
                ],
                'attendance' => [
                    'total' => Attendance::count(),
                    'today' => Attendance::today()->count(),
                    'this_week' => Attendance::thisWeek()->count(),
                    'this_month' => Attendance::thisMonth()->count(),
                ],
                'courses' => [
                    'total' => Course::count(),
                    'active' => Course::whereHas('students')->count(),
                ],
                'readers' => [
                    'total' => Reader::count(),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @return JsonResponse
     */
    public function getRecentActivities(): JsonResponse
    {
        try {
            $activities = Attendance::query()
                ->join('students', 'attendances.student_id', '=', 'students.id')
                ->join('users', 'students.user_id', '=', 'users.id')
                ->leftJoin('courses', 'students.course_id', '=', 'courses.id')
                ->leftJoin('readers', 'attendances.reader_id', '=', 'readers.id')
                ->select(
                    'attendances.id',
                    'users.user_name as student_name',
                    'students.id as student_id',
                    'courses.course_name',
                    'readers.location as reader_location',
                    'attendances.timestamp'
                )
                ->orderBy('attendances.timestamp', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'student_name' => $activity->student_name,
                        'student_id' => $activity->student_id,
                        'course_name' => $activity->course_name ?? 'N/A',
                        'reader_location' => $activity->reader_location ?? 'Unknown',
                        'timestamp' => Carbon::parse($activity->timestamp)->format('Y-m-d H:i:s'),
                        'time_ago' => Carbon::parse($activity->timestamp)->diffForHumans(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $activities,
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent activities.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * Get attendance trends for last 30 days
     *
     * @return JsonResponse
     */
    public function getAttendanceTrends(): JsonResponse
    {
        try {
            $trends = Attendance::select(
                DB::raw('DATE(timestamp) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(DISTINCT student_id) as unique_students')
            )
                ->where('timestamp', '>=', Carbon::now()->subDays(30))
                ->groupBy(DB::raw('DATE(timestamp)'))
                ->orderBy('date', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $trends,
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance trends.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get top courses by attendance
     *
     * @return JsonResponse
     */
    public function getTopCourses(): JsonResponse
    {
        try {
            $topCourses = Course::select('courses.*')
                ->withCount('attendances as attendance_count')
                ->orderBy('attendance_count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'name' => $course->course_name,
                        'identifier' => $course->course_identifier,
                        'total_attendances' => $course->attendance_count,
                        'students_enrolled' => $course->students()->count(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $topCourses,
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch top courses.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get system health status
     *
     * @return JsonResponse
     */
    public function getSystemHealth(): JsonResponse
    {
        try {
            $health = [
                'database' => [
                    'status' => 'healthy',
                    'response_time' => $this->getDatabaseResponseTime(),
                ],
                'storage' => [
                    'total' => disk_total_space('/'),
                    'free' => disk_free_space('/'),
                    'used_percentage' => round((1 - (disk_free_space('/') / disk_total_space('/'))) * 100, 2),
                ],
                'readers' => [
                    'total' => Reader::count(),
                ],
                'last_backup' => null,
            ];

            return response()->json([
                'success' => true,
                'data' => $health,
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch system health.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Measure database response time
     *
     * @return float
     */
    private function getDatabaseResponseTime(): float
    {
        $start = microtime(true);
        DB::select('SELECT 1');
        $end = microtime(true);

        return round(($end - $start) * 1000, 2);
    }
}
