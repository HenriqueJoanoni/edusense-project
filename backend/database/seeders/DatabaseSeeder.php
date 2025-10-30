<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
         User::factory(130)->create();
        $this->call(CourseSeeder::class);
//         $this->call(SubjectSeeder::class);
         $this->call(StudentsSeeder::class);
    }
}
