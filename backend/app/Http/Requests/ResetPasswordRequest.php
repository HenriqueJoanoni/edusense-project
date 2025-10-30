<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
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
            'id' => ['required', 'integer', 'exists:users,id'],
            'new_password' => ['nullable', 'string', 'min:8', 'confirmed'],
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
            'id.required' => 'The user ID is required.',
            'id.integer' => 'The user ID must be an integer.',
            'id.exists' => 'User not found.',
            'new_password.min' => 'The password must be at least 8 characters.',
            'new_password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}
