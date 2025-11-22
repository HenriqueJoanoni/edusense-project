<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Reader;
use App\Models\Student;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = Student::all();
        $readers = Reader::all();

        $students->each(function ($student) use ($readers) {
            for ($i = 0; $i < 5; $i++) {
                Attendance::create([
                    'student_id' => $student->id,
                    'reader_id' => $readers->random()->id,
                    'timestamp' => fake()->dateTimeBetween('-1 year', 'now', 'UTC')->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }
}
