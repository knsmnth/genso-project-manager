<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

use App\Http\Controllers\Api\WorkOrderController;
use App\Http\Controllers\Api\PersonnelController;
use App\Http\Controllers\Api\DailyWorkLogController;
use App\Http\Controllers\Api\TeamController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/work-orders', [WorkOrderController::class, 'index']);
Route::post('/work-orders', [WorkOrderController::class, 'store']);
Route::delete('/work-orders/{code}', [WorkOrderController::class, 'destroy']);

Route::get('/personnel', [PersonnelController::class, 'index']);
Route::post('/personnel', [PersonnelController::class, 'store']);

Route::get('/daily-work-logs', [DailyWorkLogController::class, 'index']);
Route::post('/daily-work-logs', [DailyWorkLogController::class, 'store']);

Route::get('/teams', [TeamController::class, 'index']);
Route::post('/teams', [TeamController::class, 'store']);

