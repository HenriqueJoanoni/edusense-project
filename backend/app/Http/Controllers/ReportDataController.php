<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportDataController extends Controller
{
    /**
     * @param Request $request
     * @param string|null $startDate
     * @param string|null $endDate
     * @return Request|JsonResponse
     */
    public function generateReport(Request $request, string $startDate = null, string $endDate = null): Request|JsonResponse
    {
        if ($request->isMethod('post')) {
            return $this->handlePost($request, $startDate, $endDate);
        }

        return $this->handleGet($request, $startDate, $endDate);
    }

    /**
     * @param Request $request
     * @param string|null $startDate
     * @param string|null $endDate
     * @return JsonResponse
     */
    public function handleGet(Request $request, string $startDate = null, string $endDate = null): JsonResponse
    {
        $params = $request->only(['startDate', 'endDate']);

        $data = [
            'type' => 'get',
            'startDate' => $startDate,
            'endDate' => $endDate,
            'params' => $params,
        ];

        return response()->json($data, 200);
    }

    /**
     * @param Request $request
     * @param string|null $startDate
     * @param string|null $endDate
     * @return JsonResponse
     */
    public function handlePost(Request $request, string $startDate = null, string $endDate = null): JsonResponse
    {
        $payload = $request->validate([
            'startDate' => 'required|date',
            'endDate' => 'required|date',
        ]);

        $result = [
            'type' => 'post',
            'startDate' => $startDate,
            'endDate' => $endDate,
            'payload' => $payload,
        ];

        return response()->json($result, 201);
    }
}
