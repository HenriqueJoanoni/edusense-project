<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Test Purposes Only
     * Get all users
     *
     * @return JsonResponse
     */
    public function getAllUsers(): JsonResponse
    {
        $users = User::all()->makeHidden(['user_password']);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get a specific user by ID
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:users,id',
        ]);

        $user = User::find($validated['id']);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->makeHidden(['user_password']),
                'role_label' => $user->getRoleLabel(),
                'permissions' => [
                    'is_admin' => $user->isAdmin(),
                    'can_manage_courses' => $user->canManageCourses(),
                ]
            ],
        ]);
    }

    /**
     * Update an authenticated user or specific user (admin only)
     *
     * @param UpdateUserRequest $request
     * @return JsonResponse
     */
    public function updateUser(UpdateUserRequest $request, int $id): JsonResponse
    {
        try {
            $authenticatedUser = Auth::user();
            $user = User::findOrFail($id);

            if ($user->id !== $authenticatedUser->id && !$authenticatedUser->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden. You can only update your own profile.'
                ], 403);
            }

            if ($user->id === $authenticatedUser->id && $request->has('user_role')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot change your own role. Ask another admin.'
                ], 403);
            }

            $validated = $request->validated();
            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully.',
                'data' => [
                    'user' => $user->fresh()->makeHidden(['user_password']),
                    'role' => $user->user_role->value,
                    'role_label' => $user->getRoleLabel(),
                ],
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Delete a user (admin only)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deleteUser(int $id): JsonResponse
    {
        $authenticatedUser = Auth::user();
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        if ($user->id === $authenticatedUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * Get an authenticated user profile
     *
     * @return JsonResponse
     */
    public function getProfile(): JsonResponse
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'user_name' => $user->user_name,
                'user_email' => $user->user_email,
                'user_role' => $user->user_role->value,
                'role_label' => $user->getRoleLabel(),
                'permissions' => [
                    'is_admin' => $user->isAdmin(),
                    'is_lecturer' => $user->isLecturer(),
                    'is_student' => $user->isStudent(),
                    'can_manage_courses' => $user->canManageCourses(),
                ]
            ]
        ]);
    }

    /**
     * @param UpdateUserRequest $request
     * @return JsonResponse
     */
    public function updateProfile(UpdateUserRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if ($request->has('user_role')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot change your own role.'
                ], 403);
            }

            $validated = $request->validated();
            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'data' => [
                    'user' => $user->fresh()->makeHidden(['user_password']),
                    'role' => $user->user_role->value,
                    'role_label' => $user->getRoleLabel(),
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
