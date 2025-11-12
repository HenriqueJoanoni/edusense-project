<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return Attendance::latest()->get();
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function returnAttendance(Request $request): JsonResponse
    {
        if ($request->isMethod('post')) {
            return $this->storeAttendance($request);
        }

        return $this->getAttendance($request);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function storeAttendance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'reader_id' => 'required|exists:readers,id',
            'timestamp' => 'required|date'
        ]);

        $attendance = Attendance::create($validated);

        return response()->json(['data' => $attendance], 201)
            ->header('Location', url("/api/attendances/{$attendance->id}"));
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getAttendance(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'sometimes|exists:students,id',
            'reader_id' => 'sometimes|exists:readers,id',
            'from' => 'sometimes|date',
            'to' => 'sometimes|date',
            'per_page' => 'sometimes|integer|min:1|max:100'
        ]);

        $query = Attendance::query()->orderBy('timestamp', 'desc');

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->filled('reader_id')) {
            $query->where('reader_id', $request->reader_id);
        }
        if ($request->filled('from')) {
            $query->where('timestamp', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('timestamp', '<=', $request->to);
        }

        $data = $request->filled('per_page')
            ? $query->paginate((int)$request->per_page)
            : $query->get();

        return response()->json(['data' => $data], 200);
    }

    /**
     * @return JsonResponse
     */
    public function displayAttendance(): JsonResponse
    {
        $data = Attendance::selectRaw('DATE(timestamp) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json(['data' => $data], 200);
    }

    /**
     * @param Request $request
     * @return JsonResponse|Response
     */
    public function generateReport(Request $request): JsonResponse|Response
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'format' => 'sometimes|in:json,csv'
        ]);

        $from = $request->from;
        $to = $request->to;

        $report = Attendance::select('student_id', \DB::raw('COUNT(*) as total'))
            ->whereBetween('timestamp', [$from, $to])
            ->groupBy('student_id')
            ->with('student:id,name')
            ->get();

        if ($request->get('format') === 'csv') {
            $csv = "student_id,student_name,total\n";
            foreach ($report as $row) {
                $name = $row->student->name ?? '';
                $csv .= "{$row->student_id},\"{$name}\",{$row->total}\n";
            }
            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"attendance_report_{$from}_to_{$to}.csv\""
            ]);
        }

        return response()->json([
            'from' => $from,
            'to' => $to,
            'data' => $report
        ], 200);
    }

    /**
     * Return the authenticated user's subscribed subjects.
     *
     * Logic:
     *  - uses the authenticated user to find the Student model (student.user_id)
     *  - eager loads course -> classes -> classSubjects -> subject
     *  - collects unique subjects and returns a compact list
     *
     * @return JsonResponse
     */
    public function displayStudentClassGroups(): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated user.'
            ], 401);
        }

        $student = Student::with([
            'course.classes.classSubjects.subject',
            'course.classes.classSubjects.lecturer'
        ])->where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found.'
            ], 404);
        }

        $subjects = collect();

        if ($student->course && $student->course->classes) {
            foreach ($student->course->classes as $class) {
                if ($class->classSubjects) {
                    foreach ($class->classSubjects as $classSubject) {
                        $subject = $classSubject->subject;
                        if (!$subject) {
                            continue;
                        }
                        $subjects->push([
                            'subject_id' => $subject->id,
                            'subject_name' => $subject->subject_name,
                            'subject_code' => $subject->subject_code ?? null,
                            'class_id' => $class->id,
                            'class_year' => $class->year ?? null,
                            'class_semester' => $class->semester ?? null,
                            'lecturer_id' => $classSubject->lecturer_id ?? null,
                        ]);
                    }
                }
            }
        }

        $subjects = $subjects->unique('subject_id')->values();

        return response()->json([
            'success' => true,
            'message' => 'Subscribed subjects retrieved successfully.',
            'data' => $subjects
        ], 200);
    }
}
