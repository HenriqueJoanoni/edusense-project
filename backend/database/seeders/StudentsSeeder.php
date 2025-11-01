<?php

namespace Database\Seeders;

use App\Enum\UserRolesEnum;
use App\Models\Course;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = Course::all();
        $users = User::where('user_role', UserRolesEnum::STUDENT)->get();

        foreach ($users as $user) {
            $studentData = [
                'student_name' => $user->user_name,
                'registration' => fake()->regexify('D00[0-9]{6}'),
                'rfid_code' => fake()->regexify('[A-Z0-9]{10}'),
                'qr_code' => fake()->uuid(),
                'course_id' => $courses->isNotEmpty() ? $courses->random()->id : null,
                'user_id' => $user->id,
            ];

            Student::updateOrCreate(
                ['user_id' => $user->id],
                $studentData
            );
        }
    }
}
