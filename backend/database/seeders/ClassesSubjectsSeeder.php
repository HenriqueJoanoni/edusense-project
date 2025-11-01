<?php

namespace Database\Seeders;

use App\Models\ClassSubject;
use App\Models\CourseClasses;
use App\Models\Lecturer;
use App\Models\Subject;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassesSubjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = CourseClasses::all();
        $subjects = Subject::all();
        $lecturers = Lecturer::all();

        $classes->each(function ($class) use ($subjects, $lecturers) {
            $randomSubjects = $subjects->random(rand(3, 5));

            foreach ($randomSubjects as $subject) {
                ClassSubject::create([
                    'class_id' => $class->id,
                    'subject_id' => $subject->id,
                    'lecturer_id' => $lecturers->random()->id,
                ]);
            }
        });
    }
}
