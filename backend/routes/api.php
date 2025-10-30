<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\ReportDataController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/** TEST PURPOSES */
Route::get('/users', [UserController::class, 'getAllUsers']);

/** AUTHENTICATION */
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'registerNewUser']);
Route::patch('/reset-password', [AuthController::class, 'resetUserPassword']);

Route::middleware('auth.jwt')->group(function () {
    /** User related */
    Route::get('profile', [UserController::class, 'getProfile']);
    Route::patch('update-profile', [UserController::class, 'updateProfile']);
    Route::post('logout', [AuthController::class, 'logout']);

    /** Attendance */
    Route::match(['get', 'post'], 'attendance', [AttendanceController::class, 'returnAttendance']);

    /** Barcode */
    Route::post('read-barcode/{barcodeData}', [ReaderController::class, 'readBarcode']);

    /** Report */
    Route::match(['get', 'post'], 'generate-report/{startDate?}/{endDate?}', [ReportDataController::class, 'generateReport']);

    /** Admin related */
    Route::middleware('admin')->group(function () {
        Route::post('user', [UserController::class, 'getUser']);

        Route::patch('update-user/{id}', [UserController::class, 'updateUser']);
        Route::delete('delete-user/{id}', [UserController::class, 'deleteUser']);
    });
});
