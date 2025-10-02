<?php

namespace app\Enum;

enum UserRolesEnum: string
{
    case ADMIN = 'admin';
    case STUDENT = 'student';
    case LECTURER = 'lecturer';
}
