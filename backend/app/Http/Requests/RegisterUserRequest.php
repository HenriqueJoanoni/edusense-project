<?php

namespace App\Http\Requests;

use App\Enum\UserRolesEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'user_email' => ['required', 'string', 'email', 'max:255', 'unique:users,user_email'],
            'user_password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_role' => UserRolesEnum::USER,
        ]);
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
            'user_password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}
