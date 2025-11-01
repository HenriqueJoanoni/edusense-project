<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            // Computer Science (CS101A)
            ['name' => 'Introduction to Programming', 'code' => 'CS101'],
            ['name' => 'Data Structures and Algorithms', 'code' => 'CS102'],
            ['name' => 'Computer Architecture', 'code' => 'CS103'],
            ['name' => 'Theory of Computation', 'code' => 'CS104'],
            ['name' => 'Discrete Mathematics', 'code' => 'CS105'],

            // Software Engineering (SE202B)
            ['name' => 'Software Design Patterns', 'code' => 'SE201'],
            ['name' => 'Agile Development', 'code' => 'SE202'],
            ['name' => 'Software Testing and Quality Assurance', 'code' => 'SE203'],
            ['name' => 'Requirements Engineering', 'code' => 'SE204'],
            ['name' => 'DevOps and Continuous Integration', 'code' => 'SE205'],

            // Applied Mathematics (MTH110C)
            ['name' => 'Linear Algebra', 'code' => 'MTH111'],
            ['name' => 'Calculus I', 'code' => 'MTH112'],
            ['name' => 'Calculus II', 'code' => 'MTH113'],
            ['name' => 'Differential Equations', 'code' => 'MTH114'],
            ['name' => 'Numerical Analysis', 'code' => 'MTH115'],

            // General Physics (PHY120D)
            ['name' => 'Classical Mechanics', 'code' => 'PHY121'],
            ['name' => 'Electromagnetism', 'code' => 'PHY122'],
            ['name' => 'Thermodynamics', 'code' => 'PHY123'],
            ['name' => 'Quantum Physics', 'code' => 'PHY124'],
            ['name' => 'Optics and Waves', 'code' => 'PHY125'],

            // Organic Chemistry (CHM130E)
            ['name' => 'Introduction to Organic Chemistry', 'code' => 'CHM131'],
            ['name' => 'Reaction Mechanisms', 'code' => 'CHM132'],
            ['name' => 'Spectroscopy', 'code' => 'CHM133'],
            ['name' => 'Stereochemistry', 'code' => 'CHM134'],
            ['name' => 'Organic Synthesis', 'code' => 'CHM135'],

            // Molecular Biology (BIO140F)
            ['name' => 'Cell Biology', 'code' => 'BIO141'],
            ['name' => 'Genetics', 'code' => 'BIO142'],
            ['name' => 'Biochemistry', 'code' => 'BIO143'],
            ['name' => 'Molecular Genetics', 'code' => 'BIO144'],
            ['name' => 'Biotechnology', 'code' => 'BIO145'],

            // Information Systems (IS210G)
            ['name' => 'Business Information Systems', 'code' => 'IS211'],
            ['name' => 'Enterprise Resource Planning', 'code' => 'IS212'],
            ['name' => 'Information Security', 'code' => 'IS213'],
            ['name' => 'Data Warehousing', 'code' => 'IS214'],
            ['name' => 'IT Project Management', 'code' => 'IS215'],

            // Artificial Intelligence (AI301H)
            ['name' => 'Machine Learning', 'code' => 'AI302'],
            ['name' => 'Deep Learning', 'code' => 'AI303'],
            ['name' => 'Natural Language Processing', 'code' => 'AI304'],
            ['name' => 'Computer Vision', 'code' => 'AI305'],
            ['name' => 'Reinforcement Learning', 'code' => 'AI306'],

            // Computer Networks (NET220I)
            ['name' => 'Network Protocols', 'code' => 'NET221'],
            ['name' => 'Network Security', 'code' => 'NET222'],
            ['name' => 'Wireless Networks', 'code' => 'NET223'],
            ['name' => 'Cloud Computing', 'code' => 'NET224'],
            ['name' => 'Network Administration', 'code' => 'NET225'],

            // Database Systems (DB230J)
            ['name' => 'Relational Database Design', 'code' => 'DB231'],
            ['name' => 'SQL and Query Optimisation', 'code' => 'DB232'],
            ['name' => 'NoSQL Databases', 'code' => 'DB233'],
            ['name' => 'Database Administration', 'code' => 'DB234'],
            ['name' => 'Big Data Technologies', 'code' => 'DB235'],
        ];

        foreach ($subjects as $s) {
            Subject::updateOrCreate(
                ['subject_code' => $s['code']],
                ['subject_name' => $s['name']]
            );
        }
    }
}
