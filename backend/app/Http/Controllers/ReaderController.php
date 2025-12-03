<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessAttendanceFromPubNub;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class ReaderController extends Controller
{
    /**
     * Recebe leitura direta do leitor (alternativa ao PubNub)
     */
    public function readBarcode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ID' => 'required|string',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i:s',
            'reader_id' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        ProcessAttendanceFromPubNub::dispatch(
            $request->only(['ID', 'date', 'time']),
            $request->input('reader_id', 1)
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance queued for processing'
        ]);
    }
}
