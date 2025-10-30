<?php

namespace App\Enum;

enum UserRolesEnum: string
{
    case USER = 'user';
    case ADMIN = 'admin';
    case STUDENT = 'student';
    case LECTURER = 'lecturer';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function valuesAsString(): string
    {
        return implode(',', self::values());
    }

    public function label(): string
    {
        return match ($this) {
            self::USER => 'User',
            self::ADMIN => 'Administrator',
            self::STUDENT => 'Student',
            self::LECTURER => 'Lecturer',
        };
    }

    public function isAdministrative(): bool
    {
        return $this === self::ADMIN;
    }

    public function canManageCourses(): bool
    {
        return in_array($this, [self::ADMIN, self::LECTURER]);
    }

    public static function fromString(string $role): ?self
    {
        return self::tryFrom(strtolower($role));
    }
}
