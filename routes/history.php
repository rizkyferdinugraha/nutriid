<?php

use App\Http\Controllers\FoodScanController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('history', [FoodScanController::class, 'history'])->name('history');
});
