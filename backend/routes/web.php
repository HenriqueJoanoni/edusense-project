<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/** API Routes  */
Route::middleware('api')->group(function () {

    /** TEST PURPOSES */
    Route::get('/api/users', [UserController::class, 'getAllUsers']);

   Route::get('/api/attendance', [AttendanceController::class, 'store']);
   Route::post('/api/attendance', [AttendanceController::class, 'index']);
});
