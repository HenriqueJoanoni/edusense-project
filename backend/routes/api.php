<?php

use App\Http\Controllers\PubNubController;
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

    // Return authenticated user's subscribed subjects
    Route::get('my-classes', [AttendanceController::class, 'displayStudentClassGroups']);

    // Barcode
    Route::post('read-barcode/{barcodeData}', [ReaderController::class, 'readBarcode']);

    // PubNub Integration Routes
    Route::prefix('pubnub')->group(function () {
        Route::post('publish', [PubNubController::class, 'publish']);
        Route::post('history', [PubNubController::class, 'history']);
        Route::post('presence', [PubNubController::class, 'presence']);
        Route::post('attendance', [PubNubController::class, 'publishAttendance']);
        Route::post('notification', [PubNubController::class, 'sendNotification']);
        Route::get('uuid', [PubNubController::class, 'getUuid']);
    });

    // Reports
    Route::prefix('reports')->group(function () {
        // Custom period report (accepts both GET and POST)
        Route::match(
            ['get', 'post'],
            'generate/{startDate?}/{endDate?}',
            [ReportDataController::class, 'generateReport']
        );

        // Quick reports
        Route::get('today', [ReportDataController::class, 'todayReport']);
        Route::get('week', [ReportDataController::class, 'weekReport']);
        Route::get('month', [ReportDataController::class, 'monthReport']);
    });

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
