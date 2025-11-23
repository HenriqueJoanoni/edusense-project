<?php

namespace App\Http\Middleware;

use App\Enum\UserRolesEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LecturerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user || $user->user_role !== UserRolesEnum::LECTURER) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Lecturer access required.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
