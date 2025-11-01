<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseClasses;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = Course::all();

        foreach ($courses as $course) {
            preg_match('/\d/', $course->course_identifier, $matches);
            $academicYear = !empty($matches) ? (int)$matches[0] : 1;

            $classData = [
                'year' => $academicYear,
                'semester' => rand(1, 2),
                'course_id' => $course->id,
            ];

            CourseClasses::updateOrCreate($classData);
        }
    }
}
