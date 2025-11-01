<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateReportRequest;
use App\Http\Resources\AttendanceReportResource;
use App\Models\Attendance;
use App\Services\AttendanceReportService;
use Illuminate\Http\JsonResponse;

class ReportDataController extends Controller
{
    /**
     * AttendanceReportService instance
     *
     * @var AttendanceReportService
     */
    protected AttendanceReportService $reportService;

    /**
     * Constructor
     *
     * @param AttendanceReportService $reportService
     */
    public function __construct(AttendanceReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Generate attendance report
     *
     * @param GenerateReportRequest $request
     * @param string|null $startDate
     * @param string|null $endDate
     * @return JsonResponse
     */
    public function generateReport(
        GenerateReportRequest $request,
        ?string               $startDate = null,
        ?string               $endDate = null
    ): JsonResponse
    {
        try {
            // Get validated data (merges route params and request body)
            $validated = $request->validated();

            // Generate report data
            $attendances = $this->reportService->generateReportData(
                startDate: $validated['start_date'],
                endDate: $validated['end_date'],
                studentId: $validated['student_id'] ?? null,
                courseId: $validated['course_id'] ?? null
            );

            // Generate summary statistics
            $summary = $this->reportService->generateSummary($attendances);

            // Get additional statistics
            $courseStats = $this->reportService->getStatisticsByCourse(
                $validated['start_date'],
                $validated['end_date']
            );

            $dailyTrend = $this->reportService->getDailyTrend(
                $validated['start_date'],
                $validated['end_date']
            );

            return response()->json([
                'success' => true,
                'message' => 'Report generated successfully.',
                'data' => [
                    'attendances' => AttendanceReportResource::collection($attendances),
                    'period' => [
                        'start_date' => $validated['start_date'],
                        'end_date' => $validated['end_date'],
                    ],
                    'summary' => $summary,
                    'statistics' => [
                        'by_course' => $courseStats,
                        'daily_trend' => $dailyTrend,
                    ],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while processing your request.',
            ], 500);
        }
    }

    /**
     * Get a quick report for today
     *
     * @return JsonResponse
     */
    public function todayReport(): JsonResponse
    {
        try {
            $attendances = Attendance::today()
                ->withFullDetails()
                ->latestFirst()
                ->get();

            $summary = $this->reportService->generateSummary($attendances);

            return response()->json([
                'success' => true,
                'message' => 'Today\'s report retrieved successfully.',
                'data' => [
                    'attendances' => AttendanceReportResource::collection($attendances),
                    'date' => today()->format('Y-m-d'),
                    'summary' => $summary,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate today\'s report.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred.',
            ], 500);
        }
    }

    /**
     * Get a quick report for this week
     *
     * @return JsonResponse
     */
    public function weekReport(): JsonResponse
    {
        try {
            $attendances = Attendance::thisWeek()
                ->withFullDetails()
                ->latestFirst()
                ->get();

            $summary = $this->reportService->generateSummary($attendances);

            return response()->json([
                'success' => true,
                'message' => 'This week\'s report retrieved successfully.',
                'data' => [
                    'attendances' => AttendanceReportResource::collection($attendances),
                    'period' => [
                        'start_date' => now()->startOfWeek()->format('Y-m-d'),
                        'end_date' => now()->endOfWeek()->format('Y-m-d'),
                    ],
                    'summary' => $summary,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate this week\'s report.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred.',
            ], 500);
        }
    }

    /**
     * Get a quick report for this month
     *
     * @return JsonResponse
     */
    public function monthReport(): JsonResponse
    {
        try {
            $attendances = Attendance::thisMonth()
                ->withFullDetails()
                ->latestFirst()
                ->get();

            $summary = $this->reportService->generateSummary($attendances);

            return response()->json([
                'success' => true,
                'message' => 'This month\'s report retrieved successfully.',
                'data' => [
                    'attendances' => AttendanceReportResource::collection($attendances),
                    'period' => [
                        'start_date' => now()->startOfMonth()->format('Y-m-d'),
                        'end_date' => now()->endOfMonth()->format('Y-m-d'),
                    ],
                    'summary' => $summary,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate this month\'s report.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred.',
            ], 500);
        }
    }
}
