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
use App\Http\Controllers\Api\CatalogController;

use App\Http\Controllers\Api\DailyWorkLogSnapshotController;

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

Route::get('/daily-work-log-snapshots', [DailyWorkLogSnapshotController::class, 'index']);
Route::get('/daily-work-log-snapshots/{date}', [DailyWorkLogSnapshotController::class, 'show']);
Route::post('/daily-work-log-snapshots', [DailyWorkLogSnapshotController::class, 'store']);
Route::put('/daily-work-log-snapshots/{date}', [DailyWorkLogSnapshotController::class, 'update']);

Route::get('/teams', [TeamController::class, 'index']);
Route::post('/teams', [TeamController::class, 'store']);

Route::get('/catalogs', [CatalogController::class, 'index']);
Route::post('/catalogs', [CatalogController::class, 'store']);
Route::put('/catalogs/{id}', [CatalogController::class, 'update']);
Route::delete('/catalogs/{id}', [CatalogController::class, 'destroy']);


