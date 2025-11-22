<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\PubNubService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PubNubController extends Controller
{
    protected PubNubService $pubNubService;

    public function __construct(PubNubService $pubNubService)
    {
        $this->pubNubService = $pubNubService;
    }

    /**
     * Publish a message to a channel
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function publish(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'channel' => 'required|string',
            'message' => 'required',
            'metadata' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->pubNubService->publish(
            $request->input('channel'),
            $request->input('message'),
            $request->input('metadata', [])
        );

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Get channel history
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function history(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'channel' => 'required|string',
            'count' => 'sometimes|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->pubNubService->history(
            $request->input('channel'),
            $request->input('count', 100)
        );

        return response()->json($result);
    }

    /**
     * Get presence information
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function presence(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'channel' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->pubNubService->hereNow($request->input('channel'));

        return response()->json($result);
    }

    /**
     * Publish attendance update
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function publishAttendance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|integer',
            'status' => 'required|in:present,absent,late',
            'class_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $message = [
            'type' => 'attendance_update',
            'student_id' => $request->input('student_id'),
            'status' => $request->input('status'),
            'class_id' => $request->input('class_id'),
            'timestamp' => now()->toIso8601String(),
            'user_id' => auth()->id(),
            'user_email' => auth()->user()->user_email ?? null,
        ];

        $channel = config('pubnub.channels.attendance');

        $result = $this->pubNubService->publish($channel, $message);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Send a notification to a channel
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sendNotification(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'type' => 'sometimes|string|in:info,warning,error,success',
            'recipients' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $message = [
            'type' => 'notification',
            'title' => $request->input('title'),
            'body' => $request->input('body'),
            'notification_type' => $request->input('type', 'info'),
            'recipients' => $request->input('recipients', []),
            'timestamp' => now()->toIso8601String(),
            'sender_id' => auth()->id(),
            'sender_email' => auth()->user()->user_email ?? null,
        ];

        $channel = config('pubnub.channels.notifications');

        $result = $this->pubNubService->publish($channel, $message);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Get current UUID being used
     *
     * @return JsonResponse
     */
    public function getUuid(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'uuid' => $this->pubNubService->getUuid(),
            'user_id' => auth()->id(),
            'user_email' => auth()->user()->user_email ?? null,
        ]);
    }
}
