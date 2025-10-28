<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Exceptions\JWTException;

class UserController extends Controller
{
    /**
     * Test Purposes Only
     *
     * @return JsonResponse
     */
    public function getAllUsers(): JsonResponse
    {
        $users = User::all();
        return response()->json($users);
    }

    /**
     * @return JsonResponse
     */
    public function getUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:users,id',
        ]);

        $admin = Auth::user();
        if (!$admin || $admin->user_role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.'
            ], 403);
        }

        $user = User::find($validated['id']);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        $userArray = $user->toArray();
        unset($userArray['user_password']);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $userArray,
            ],
        ]);
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
    public function updateUser(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            // TODO: Add validation rules for user_name and user_email
            $user->update($request->only(['user_name', 'user_email']));
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }
}
