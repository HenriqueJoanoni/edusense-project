<?php

namespace Database\Seeders;

use App\Enum\UserRolesEnum;
use App\Models\Lecturer;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LecturerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('user_role', UserRolesEnum::LECTURER)->get();

        foreach ($users as $lecturer) {
            $cleanName = preg_replace('/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.|Miss\.|Jr\.)\s*/i', '', $lecturer->user_name);
            $emailName = Str::lower(Str::ascii($cleanName));
            $emailName = str_replace(' ', '.', $emailName);

            $lecturerData = [
                'lecturer_name' => $lecturer->user_name,
                'lecturer_email' => $emailName . '@dkit.ie',
                'user_id' => $lecturer->id,
            ];

            Lecturer::updateOrCreate($lecturerData);
        }
    }
}
