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
     * @return JsonResponse
     */
    public function getMySubjects(): JsonResponse
    {
        try {
            $lecturer = $this->getOrCreateLecturer();

            if (!$lecturer) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a lecturer.',
                ], Response::HTTP_FORBIDDEN);
            }

            $subjects = ClassSubject::query()
                ->where('lecturer_id', $lecturer->id)
                ->with([
                    'subject:id,subject_name,subject_code',
                    'class:id,year,semester,course_id',
                    'class.course' => function ($query) {
                        $query->select('id', 'course_name')
                            ->withCount('students');
                    }
                ])
                ->get()
                ->map(function ($classSubject) {
                    return [
                        'class_subject_id' => $classSubject->id,
                        'subject_id' => $classSubject->subject->id,
                        'subject_name' => $classSubject->subject->subject_name,
                        'subject_code' => $classSubject->subject->subject_code,
                        'course_name' => $classSubject->class->course->course_name ?? 'N/A',
                        'year' => $classSubject->class->year ?? 'N/A',
                        'semester' => $classSubject->class->semester ?? 'N/A',
                        'total_students' => $classSubject->class->course->students_count ?? 0,
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

            $classSubject = ClassSubject::with(['class.course', 'subject:id,subject_name,subject_code'])
                ->find($classSubjectId);

            $courseId = $classSubject->class->course_id;

            $studentsQuery = Student::where('course_id', $courseId)
                ->with('user:id,user_name,user_email');

            if ($request->student_search) {
                $studentsQuery->where(function ($q) use ($request) {
                    $search = $request->student_search;
                    $q->where('student_name', 'like', "%{$search}%")
                        ->orWhere('registration', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('user_name', 'like', "%{$search}%")
                                ->orWhere('user_email', 'like', "%{$search}%");
                        });
                });
            }

            $students = $studentsQuery->get();
            $studentIds = $students->pluck('id');

            $attendancesGrouped = Attendance::whereIn('student_id', $studentIds)
                ->whereBetween('timestamp', [$startDate, $endDate])
                ->get()
                ->groupBy('student_id');

            $totalClassDays = Attendance::whereBetween('timestamp', [$startDate, $endDate])
                ->selectRaw('COUNT(DISTINCT DATE(timestamp)) as total')
                ->value('total') ?? 0;

            $studentsData = $students->map(function ($student) use ($attendancesGrouped, $totalClassDays) {
                $attendances = $attendancesGrouped->get($student->id, collect());
                $attendedClasses = $attendances->count();
                $missedClasses = max(0, $totalClassDays - $attendedClasses);
                $attendanceRate = $totalClassDays > 0 ? round(($attendedClasses / $totalClassDays) * 100, 2) : 0;

                return [
                    'student_id' => $student->id,
                    'student_name' => $student->student_name ?? $student->user?->user_name ?? 'N/A',
                    'student_email' => $student->user?->user_email ?? 'N/A',
                    'student_number' => $student->registration,
                    'total_classes' => $totalClassDays,
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
                    'subject' => [
                        'name' => $classSubject->subject->subject_name,
                        'code' => $classSubject->subject->subject_code,
                        'course' => $classSubject->class->course->course_name,
                    ],
                    'students' => $studentsData->values(),
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                    ],
                    'summary' => [
                        'total_students' => $studentsData->count(),
                        'total_class_days' => $totalClassDays,
                        'good_attendance' => $studentsData->where('status', 'good')->count(),
                        'warning_attendance' => $studentsData->where('status', 'warning')->count(),
                        'critical_attendance' => $studentsData->where('status', 'critical')->count(),
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

            $courseIds = ClassSubject::where('lecturer_id', $lecturer->id)
                ->join('classes', 'class_subjects.class_id', '=', 'classes.id')
                ->distinct()
                ->pluck('classes.course_id');

            $studentIds = Student::whereIn('course_id', $courseIds)
                ->pluck('id');

            $stats = [
                'total_subjects' => $classSubjectIds->count(),
                'total_students' => $studentIds->count(),
                'attendances_today' => Attendance::whereIn('student_id', $studentIds)
                    ->whereDate('timestamp', Carbon::today())
                    ->count(),
                'attendances_this_week' => Attendance::whereIn('student_id', $studentIds)
                    ->whereBetween('timestamp', [
                        Carbon::now()->startOfWeek(),
                        Carbon::now()->endOfWeek()
                    ])
                    ->count(),
                'average_attendance_rate' => $this->calculateAverageAttendanceRate($studentIds),
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
     * Get total classes in period
     *
     * @param string $startDate
     * @param string $endDate
     * @return int
     */
    private function getTotalClassesInPeriod(string $startDate, string $endDate): int
    {
        return Attendance::whereBetween('timestamp', [$startDate, $endDate])
            ->distinct()
            ->count(DB::raw('DATE(timestamp)'));
    }

    /**
     * Calculate average attendance rate
     *
     * @param Collection $studentIds
     * @return float
     */
    private function calculateAverageAttendanceRate(Collection $studentIds): float
    {
        if ($studentIds->isEmpty()) {
            return 0;
        }

        $totalAttendances = Attendance::whereIn('student_id', $studentIds)
            ->whereBetween('timestamp', [Carbon::now()->subDays(30), Carbon::now()])
            ->count();

        $totalPossible = $studentIds->count() * 30;

        return $totalPossible > 0 ? round(($totalAttendances / $totalPossible) * 100, 2) : 0;
    }
}
