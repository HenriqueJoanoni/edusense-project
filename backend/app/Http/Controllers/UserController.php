<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * @return JsonResponse
     */
    public function getAllUsers(): JsonResponse
    {
        $users = User::all();
        return response()->json($users);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8'
        ]);

        try {
            $user = User::where('email', $request->input('email'))->first();

            if (!$user || !Hash::check($request->input('password'), $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Credentials.'
                ], 401);
            }

            $userArray = $user->toArray();
            unset($userArray['password']);

            return response()->json([
                'success' => true,
                'message' => 'Authentication successful.',
                'data' => [
                    'user' => $userArray,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error during login processing.'
            ], 500);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function registerNewUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $userArray = $user->toArray();
            unset($userArray['password']);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully.',
                'data' => [
                    'user' => $userArray,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error during user creation.'
            ], 500);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function resetUserPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:users,id',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        try {
            $user = User::find($validated['id']);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.'
                ], 404);
            }

            $password = $validated['new_password'] ?? config('app.default_user_password');
            $user->password = Hash::make($password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully.',
                'data' => [
                    'id' => $user->id,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset the password.',
            ], 500);
        }
    }
}
