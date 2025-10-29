<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function registerNewUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'user_email' => 'required|string|email|max:255|unique:users',
            'user_password' => 'required|string|min:8',
        ]);

        try {
            $user = User::create([
                'user_name' => $validated['user_name'],
                'user_email' => $validated['user_email'],
                'user_password' => Hash::make($validated['user_password']),
                'user_role' => 'user',
            ]);

            try {
                $token = JWTAuth::fromUser($user);
            } catch (JWTException $e) {
                return response()->json(['error' => 'Could not create token'], 500);
            }

            $userArray = $user->toArray();
            unset($userArray['user_password']);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully.',
                'token' => $token,
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
    public function login(Request $request): JsonResponse
    {
        $credentials = [
            'user_email' => $request->input('user_email'),
            'password' => $request->input('user_password'),
        ];

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            $user = User::where('user_email', $request->input('user_email'))->first();
            $userArray = $user->toArray();
            unset($userArray['user_password']);

            return response()->json([
                'success' => true,
                'message' => 'Authentication successful.',
                'token' => $token,
                'expires_in' => auth('api')->factory()->getTTL() * 60,
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
    public function resetUserPassword(Request $request): JsonResponse
    {
        // TODO: Add confirmed on new_password field and validate it matches new_password
        $validated = $request->validate([
            'id' => 'required|integer|exists:users,id',
            'new_password' => 'nullable|string|min:8',
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
            $user->user_password = Hash::make($password);
            $user->save();

            try {
                $token = JWTAuth::fromUser($user);
            } catch (JWTException $e) {
                return response()->json(['error' => 'Could not create token'], 500);
            }

            $userArray = $user->toArray();
            unset($userArray['user_password']);

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully.',
                'data' => [
                    'user' => $userArray,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset the password.',
            ], 500);
        }
    }

    /**
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout, please try again'], 500);
        }

        return response()->json(['message' => 'Successfully logged out']);
    }
}
