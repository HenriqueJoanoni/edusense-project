<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\ReportDataController;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/
Route::post('register', [AuthController::class, 'registerNewUser']);
Route::post('login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (JWT Required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth.jwt')->group(function () {

    // Auth endpoints
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);

    // User profile
    Route::get('profile', [UserController::class, 'getProfile']);
    Route::patch('profile', [UserController::class, 'updateProfile']);

    // User management (view)
    Route::post('user', [UserController::class, 'getUser']);

    // Attendance
    Route::match(['get', 'post'], 'attendance', [AttendanceController::class, 'returnAttendance']);

    // Barcode
    Route::post('read-barcode/{barcodeData}', [ReaderController::class, 'readBarcode']);

    // Report
    Route::match(['get', 'post'], 'generate-report/{startDate?}/{endDate?}', [ReportDataController::class, 'generateReport']);

    /*
    |--------------------------------------------------------------------------
    | Admin Only Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->group(function () {
        // User management (admin)
        Route::get('users', [UserController::class, 'getAllUsers']);
        Route::patch('update-user/{id}', [UserController::class, 'updateUser']);
        Route::delete('delete-user/{id}', [UserController::class, 'deleteUser']);

        // Password reset (admin only)
        Route::post('reset-password', [AuthController::class, 'resetUserPassword']);
    });
});
