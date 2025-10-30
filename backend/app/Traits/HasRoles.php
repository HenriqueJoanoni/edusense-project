<?php

namespace App\Traits;

use App\Enum\UserRolesEnum;

trait HasRoles
{
    public function isAdmin(): bool
    {
        return $this->user_role === UserRolesEnum::ADMIN;
    }

    public function isStudent(): bool
    {
        return $this->user_role === UserRolesEnum::STUDENT;
    }

    public function isLecturer(): bool
    {
        return $this->user_role === UserRolesEnum::LECTURER;
    }

    public function isUser(): bool
    {
        return $this->user_role === UserRolesEnum::USER;
    }

    public function hasRole(UserRolesEnum $role): bool
    {
        return $this->user_role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->user_role, $roles, true);
    }

    public function canManageCourses(): bool
    {
        return $this->user_role->canManageCourses();
    }

    public function getRoleLabel(): string
    {
        return $this->user_role->label();
    }
}
