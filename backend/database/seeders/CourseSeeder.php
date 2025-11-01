<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            ['course_name' => 'Computer Science', 'course_identifier' => fake()->regexify('CS[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'Software Engineering', 'course_identifier' => fake()->regexify('SE[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'Applied Mathematics', 'course_identifier' => fake()->regexify('MTH[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'General Physics', 'course_identifier' => fake()->regexify('PHY[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'Organic Chemistry', 'course_identifier' => fake()->regexify('CHM[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'Molecular Biology', 'course_identifier' => fake()->regexify('BIO[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'Information Systems', 'course_identifier' => fake()->regexify('IS[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'Artificial Intelligence', 'course_identifier' => fake()->regexify('AI[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'Computer Networks', 'course_identifier' => fake()->regexify('NET[1-4]{1}[A-Z0-9]{3}')],
            ['course_name' => 'Database Systems', 'course_identifier' => fake()->regexify('DB[1-4]{1}[A-Z0-9]{3}')],
        ];

        foreach ($courses as $course) {
            Course::updateOrCreate($course, [
                'course_name' => $course['course_name'],
                'course_identifier' => $course['course_identifier'],
            ]);
        }
    }
}
