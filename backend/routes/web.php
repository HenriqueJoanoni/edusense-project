<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\ReportDataController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/** API Routes  */
Route::middleware('api')->group(function () {
    /** TEST PURPOSES */
    Route::get('/api/users', [UserController::class, 'getAllUsers']);

    /** AUTHENTICATION */
    Route::post('/api/login', [UserController::class, 'login']);

    /** ATTENDANCE */
    Route::match(['get', 'post'], '/api/attendance', [AttendanceController::class, 'returnAttendance']);

    /** READ BARCODE (Python Integration) */
    Route::post('/api/read-barcode/{barcodeData}', [ReaderController::class, 'readBarcode']);

    /** REPORT */
    Route::match(['get', 'post'], '/api/generate-report/{startDate?}/{endDate?}', [ReportDataController::class, 'generateReport']);
});
