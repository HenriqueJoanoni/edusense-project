<?php

namespace App\Http\Requests;

use App\Enum\UserRolesEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $userId = $this->route('id') ?? $this->user()->id;

        return [
            'id' => ['sometimes', 'integer', 'exists:users,id'],
            'user_name' => ['sometimes', 'string', 'max:255'],
            'user_email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,user_email,' . $userId],
            'user_password' => ['sometimes', 'string', 'min:8'],
            'user_role' => ['sometimes', new Enum(UserRolesEnum::class)],
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
            'id.integer' => 'The ID must be an integer.',
            'id.exists' => 'User not found.',
            'user_name.string' => 'The user name must be a string.',
            'user_name.max' => 'The user name may not be greater than 255 characters.',
            'user_email.string' => 'The email must be a string.',
            'user_email.email' => 'The email must be a valid email address.',
            'user_email.max' => 'The email may not be greater than 255 characters.',
            'user_email.unique' => 'This email is already in use.',
            'user_password.string' => 'The password must be a string.',
            'user_password.min' => 'The password must be at least 8 characters.',
            'user_role.Illuminate\Validation\Rules\Enum' => 'The user role must be one of the following: ' . UserRolesEnum::valuesAsString(),
        ];
    }
}
