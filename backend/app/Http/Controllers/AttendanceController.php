<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'reader_id' => 'required|exists:readers,id',
            'timestamp' => 'required|date'
        ]);

        $attendance = Attendance::create($request->all());

        return response()->json($attendance, 201);
    }
}
