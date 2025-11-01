<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => [
                'name' => $this->student?->student_name ?? 'N/A',
                'registration' => $this->student?->registration ?? 'N/A',
            ],
            'course' => [
                'name' => $this->student?->course?->course_name ?? 'N/A',
                'identifier' => $this->student?->course?->course_identifier ?? 'N/A',
            ],
            'reader' => [
                'code' => $this->reader?->code ?? 'N/A',
                'location' => $this->reader?->location ?? 'N/A',
            ],
            'timestamp' => [
                'date' => $this->timestamp->format('Y-m-d'),
                'time' => $this->timestamp->format('H:i:s'),
                'datetime' => $this->timestamp->toIso8601String(),
            ],
        ];
    }
}
