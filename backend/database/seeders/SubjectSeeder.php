<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            ['name' => 'Introduction to Programming', 'code' => 'SD101'],
            ['name' => 'Data Structures', 'code' => 'SD102'],
            ['name' => 'Algorithms', 'code' => 'SD103'],
            ['name' => 'Databases', 'code' => 'SD201'],
            ['name' => 'Web Development', 'code' => 'SD202'],
            ['name' => 'Software Engineering', 'code' => 'SD203'],
            ['name' => 'Operating Systems', 'code' => 'SD204'],
            ['name' => 'Computer Networks', 'code' => 'SD205'],
            ['name' => 'User Interfaces and UX', 'code' => 'SD301'],
            ['name' => 'Mobile Development', 'code' => 'SD302'],
            ['name' => 'Testing and Software Quality', 'code' => 'SD303'],
        ];

        foreach ($subjects as $s) {
            Subject::updateOrCreate(
                ['subject_name' => $s['name']],
                ['subject_code' => $s['code']]
            );
        }
    }
}
