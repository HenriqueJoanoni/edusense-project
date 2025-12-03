<?php

namespace App\Jobs;

use App\Models\Attendance;
use App\Models\Student;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProcessAttendanceFromPubNub
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public array $messageData,
        public int $readerId = 1
    ) {
    }

    /**
     * @throws Exception
     */
    public function handle(): void
    {
        try {
            $student = Student::where('registration', $this->messageData['ID'])->first();

            if (!$student) {
                Log::warning('Student not found', ['id' => $this->messageData['ID']]);
                return;
            }

            Attendance::create([
                'student_id' => $student->id,
                'reader_id' => $this->readerId,
                'timestamp' => Carbon::parse(
                    $this->messageData['date'] . ' ' . $this->messageData['time']
                )
            ]);

            Log::info('Attendance recorded', [
                'student_id' => $student->id,
                'timestamp' => $this->messageData['date'] . ' ' . $this->messageData['time']
            ]);

        } catch (Exception $e) {
            Log::error('Attendance processing failed', [
                'error' => $e->getMessage(),
                'data' => $this->messageData
            ]);
            throw $e;
        }
    }
}
