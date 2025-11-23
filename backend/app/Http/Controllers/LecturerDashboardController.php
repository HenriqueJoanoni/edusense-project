<?php

namespace App\Http\Controllers;

use App\Enum\UserRolesEnum;
use App\Models\Lecturer;
use App\Models\Subject;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\ClassSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LecturerDashboardController extends Controller
{
    /**
     * Get or create lecturer profile
     *
     * @return Lecturer|null
     */
    private function getOrCreateLecturer(): ?Lecturer
    {
        $userId = auth()->id();
        $user = auth()->user();

        if ($user->user_role !== UserRolesEnum::LECTURER) {
            return null;
        }

        return Lecturer::firstOrCreate(
            ['user_id' => $userId],
            [
                'user_id' => $userId,
                'lecturer_name' => $user->user_name,
                'lecturer_email' => $user->user_email,
            ]
        );
    }

    /**
     * Get lecturer's subjects
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getMySubjects(Request $request): JsonResponse
    {
        try {
            $lecturer = $this->getOrCreateLecturer();

            if (!$lecturer) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a lecturer.',
                ], Response::HTTP_FORBIDDEN);
            }

            $subjects = ClassSubject::where('lecturer_id', $lecturer->id)
                ->with(['subject', 'courseClass.course'])
                ->get()
                ->map(function ($classSubject) {
                    return [
                        'class_subject_id' => $classSubject->id,
                        'subject_id' => $classSubject->subject->id,
                        'subject_name' => $classSubject->subject->subject_name,
                        'course_name' => $classSubject->courseClass->course->course_name ?? 'N/A',
                        'class_name' => $classSubject->courseClass->class_name ?? 'N/A',
                        'total_students' => $this->getTotalStudents($classSubject),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $subjects,
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subjects.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get attendance overview for a specific subject
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSubjectAttendance(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'class_subject_id' => 'required|integer|exists:class_subjects,id',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'student_search' => 'nullable|string',
            ]);

            $classSubjectId = $validated['class_subject_id'];
            $startDate = $validated['start_date'] ?? Carbon::now()->subDays(30)->format('Y-m-d');
            $endDate = $validated['end_date'] ?? Carbon::now()->format('Y-m-d');

            if (!$this->verifyLecturerOwnership($classSubjectId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this subject.',
                ], Response::HTTP_FORBIDDEN);
            }

            $classSubject = ClassSubject::with('courseClass')->find($classSubjectId);
            $classId = $classSubject->class_id;

            $students = DB::table('students')
                ->join('users', 'students.user_id', '=', 'users.id')
                ->join('class_students', 'students.id', '=', 'class_students.student_id')
                ->where('class_students.class_id', $classId)
                ->when($request->student_search, function ($query, $search) {
                    return $query->where(function ($q) use ($search) {
                        $q->where('users.user_name', 'like', "%{$search}%")
                            ->orWhere('users.user_email', 'like', "%{$search}%")
                            ->orWhere('students.student_name', 'like', "%{$search}%");
                    });
                })
                ->select(
                    'students.id as student_id',
                    'students.student_name',
                    'students.registration as student_number',
                    'users.user_name',
                    'users.user_email as student_email'
                )
                ->distinct()
                ->get()
                ->map(function ($student) use ($classSubjectId, $startDate, $endDate) {
                    $attendances = Attendance::where('student_id', $student->student_id)
                        ->where('class_subject_id', $classSubjectId)
                        ->whereBetween('timestamp', [$startDate, $endDate])
                        ->get();

                    $totalClasses = $this->getTotalClassesInPeriod($classSubjectId, $startDate, $endDate);
                    $attendedClasses = $attendances->count();
                    $missedClasses = max(0, $totalClasses - $attendedClasses);
                    $attendanceRate = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100, 2) : 0;

                    return [
                        'student_id' => $student->student_id,
                        'student_name' => $student->student_name ?? $student->user_name,
                        'student_email' => $student->student_email,
                        'student_number' => $student->student_number,
                        'total_classes' => $totalClasses,
                        'attended' => $attendedClasses,
                        'missed' => $missedClasses,
                        'attendance_rate' => $attendanceRate,
                        'status' => $attendanceRate >= 75 ? 'good' : ($attendanceRate >= 50 ? 'warning' : 'critical'),
                        'last_attendance' => $attendances->sortByDesc('timestamp')->first()?->timestamp?->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'students' => $students->values(),
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                    ],
                    'summary' => [
                        'total_students' => $students->count(),
                        'good_attendance' => $students->where('status', 'good')->count(),
                        'warning_attendance' => $students->where('status', 'warning')->count(),
                        'critical_attendance' => $students->where('status', 'critical')->count(),
                    ],
                ],
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance data.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get attendance statistics for lecturer
     *
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $lecturer = $this->getOrCreateLecturer();

            if (!$lecturer) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a lecturer.',
                ], Response::HTTP_FORBIDDEN);
            }

            $classSubjectIds = ClassSubject::where('lecturer_id', $lecturer->id)
                ->pluck('id');

            $totalStudents = DB::table('class_students')
                ->join('class_subjects', 'class_students.class_id', '=', 'class_subjects.class_id')
                ->whereIn('class_subjects.id', $classSubjectIds)
                ->distinct('class_students.student_id')
                ->count('class_students.student_id');

            $stats = [
                'total_subjects' => $classSubjectIds->count(),
                'total_students' => $totalStudents,
                'attendances_today' => Attendance::whereIn('class_subject_id', $classSubjectIds)
                    ->whereDate('timestamp', Carbon::today())
                    ->count(),
                'attendances_this_week' => Attendance::whereIn('class_subject_id', $classSubjectIds)
                    ->whereBetween('timestamp', [
                        Carbon::now()->startOfWeek(),
                        Carbon::now()->endOfWeek()
                    ])
                    ->count(),
                'average_attendance_rate' => $this->calculateAverageAttendanceRate($classSubjectIds),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Verify if lecturer owns the subject
     *
     * @param int $classSubjectId
     * @return bool
     */
    private function verifyLecturerOwnership(int $classSubjectId): bool
    {
        $lecturer = $this->getOrCreateLecturer();

        if (!$lecturer) {
            return false;
        }

        return ClassSubject::where('id', $classSubjectId)
            ->where('lecturer_id', $lecturer->id)
            ->exists();
    }

    /**
     * Get total students for a class subject
     *
     * @param ClassSubject $classSubject
     * @return int
     */
    private function getTotalStudents(ClassSubject $classSubject): int
    {
        return DB::table('class_students')
            ->where('class_id', $classSubject->class_id)
            ->count();
    }

    /**
     * Get total classes in period
     *
     * @param int $classSubjectId
     * @param string $startDate
     * @param string $endDate
     * @return int
     */
    private function getTotalClassesInPeriod(int $classSubjectId, string $startDate, string $endDate): int
    {
        return Attendance::where('class_subject_id', $classSubjectId)
            ->whereBetween('timestamp', [$startDate, $endDate])
            ->distinct('timestamp')
            ->count(DB::raw('DATE(timestamp)'));
    }

    /**
     * Calculate average attendance rate
     *
     * @param Collection $classSubjectIds
     * @return float
     */
    private function calculateAverageAttendanceRate(Collection $classSubjectIds): float
    {
        if ($classSubjectIds->isEmpty()) {
            return 0;
        }

        $totalAttendances = Attendance::whereIn('class_subject_id', $classSubjectIds)
            ->whereBetween('timestamp', [Carbon::now()->subDays(30), Carbon::now()])
            ->count();

        $totalStudents = DB::table('class_students')
            ->join('class_subjects', 'class_students.class_id', '=', 'class_subjects.class_id')
            ->whereIn('class_subjects.id', $classSubjectIds)
            ->distinct('class_students.student_id')
            ->count('class_students.student_id');

        $totalPossible = $totalStudents * 30;

        return $totalPossible > 0 ? round(($totalAttendances / $totalPossible) * 100, 2) : 0;
    }
}
