<?php

namespace App\Models;

use App\Enum\UserRolesEnum;
use App\Traits\HasRoles;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /******************************************************************
     *  Necessary methods to override JWTAuth::attempt default params *
     ******************************************************************/

    public function getAuthPassword()
    {
        return $this->attributes['user_password'];
    }

    /**
     * This method is used to get the password attribute for authentication
     */
    public function getPasswordAttribute()
    {
        return $this->attributes['user_password'] ?? null;
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->user_role->value,
            'name' => $this->user_name
        ];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_name',
        'user_email',
        'user_password',
        'user_role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'user_password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_role' => UserRolesEnum::class,
            'email_verified_at' => 'datetime'
        ];
    }

    protected function userPassword(): Attribute
    {
        return Attribute::make(
            set: fn(string $value) => bcrypt($value),
        );
    }
}
