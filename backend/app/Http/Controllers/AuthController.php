<?php

namespace App\Http\Controllers;

use App\Enum\UserRolesEnum;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Register a new user
     *
     * @param RegisterUserRequest $request
     * @return JsonResponse
     */
    public function registerNewUser(RegisterUserRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $validated['user_role'] = $validated['user_role'] ?? UserRolesEnum::USER;
            $user = User::create($validated);
            $token = $this->generateToken($user);

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not create token.'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'User created successfully.',
                'token' => $token,
                'expires_in' => $this->getTokenTTL(),
                'data' => [
                    'user' => $user->makeHidden(['user_password']),
                    'role' => $user->user_role->value,
                    'role_label' => $user->getRoleLabel(),
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error during user registration.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Authenticate user and return JWT token
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $credentials = [
                'user_email' => $request->input('user_email'),
                'password' => $request->input('user_password'),
            ];

            $token = JWTAuth::attempt($credentials);

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials.'
                ], 401);
            }

            $user = auth()->user();

            return response()->json([
                'success' => true,
                'message' => 'Authentication successful.',
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => $this->getTokenTTL(),
                'data' => [
                    'user' => $user->makeHidden(['user_password']),
                    'role' => $user->user_role->value,
                    'role_label' => $user->getRoleLabel(),
                    'permissions' => [
                        'is_admin' => $user->isAdmin(),
                        'is_lecturer' => $user->isLecturer(),
                        'is_student' => $user->isStudent(),
                        'can_manage_courses' => $user->canManageCourses(),
                    ]
                ],
            ], 200);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not create token.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error during login processing.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Reset user password
     *
     * @param ResetPasswordRequest $request
     * @return JsonResponse
     */
    public function resetUserPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            if ($request->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot reset your own password.'
                ], 403);
            }

            $validated = $request->validated();
            $user = User::findOrFail($validated['id']);

            $password = (!empty($validated['new_password'])) ? $validated['new_password'] : config('app.default_user_password');

            $user->update(['user_password' => $password]);

            $token = $this->generateToken($user);

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password reset successfully, but could not create token.'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully.',
                'token' => $token,
                'expires_in' => $this->getTokenTTL(),
                'data' => [
                    'user' => $user->fresh()->makeHidden(['user_password']),
                ],
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Password reset, but failed to generate token.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset the password.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Invalidate user token (logout)
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out.'
            ], 200);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to logout, please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Refresh the JWT token
     *
     * @return JsonResponse
     */
    public function refresh(): JsonResponse
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully.',
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => $this->getTokenTTL(),
            ], 200);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not refresh token.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get the authenticated user
     *
     * @return JsonResponse
     */
    public function me(): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user->makeHidden(['user_password']),
                    'role' => $user->user_role->value,
                    'role_label' => $user->getRoleLabel(),
                    'permissions' => [
                        'is_admin' => $user->isAdmin(),
                        'is_lecturer' => $user->isLecturer(),
                        'is_student' => $user->isStudent(),
                        'can_manage_courses' => $user->canManageCourses(),
                    ]
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user data.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Generate JWT token for user
     *
     * @param User $user
     * @return string|null
     */
    private function generateToken(User $user): ?string
    {
        try {
            return JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return null;
        }
    }

    /**
     * Get JWT token TTL (Time To Live) in seconds
     *
     * @return int
     */
    private function getTokenTTL(): int
    {
        return auth('api')->factory()->getTTL() * 60;
    }
}
