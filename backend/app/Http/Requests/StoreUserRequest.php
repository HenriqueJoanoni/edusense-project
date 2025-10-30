<?php

namespace App\Http\Requests;

use App\Enum\UserRolesEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'user_name' => ['required', 'string', 'max:255'],
            'user_email' => ['required', 'email', 'unique:users,user_email'],
            'user_password' => ['required', 'string', 'min:8'],
            'user_role' => ['required', new Enum(UserRolesEnum::class)],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'user_name.required' => 'The user name is required.',
            'user_name.max' => 'The user name must not exceed 255 characters.',
            'user_email.required' => 'The email is required.',
            'user_email.email' => 'The email must be a valid email address.',
            'user_email.unique' => 'This email is already in use.',
            'user_password.required' => 'The password is required.',
            'user_password.min' => 'The password must be at least 8 characters.',
            'user_role.required' => 'The user role is required.',
            'user_role.Illuminate\Validation\Rules\Enum' => 'The user role must be one of the following: ' . UserRolesEnum::valuesAsString(),
        ];
    }
}
