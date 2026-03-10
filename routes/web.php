<?php

use App\Http\Controllers\FoodScanController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'landing', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    
    // Food Scan Routes
    Route::get('scan', [FoodScanController::class, 'scan'])->name('scan');
    
    // Nutrition Analysis Routes
    Route::get('analysis', [\App\Http\Controllers\NutritionAnalysisController::class, 'index'])->name('analysis');
    
    // API Routes
    Route::prefix('api')->group(function () {
        // Food Scan Routes
        Route::post('food-scan', [FoodScanController::class, 'store'])->name('api.food-scan.store');
        Route::get('food-scan', [FoodScanController::class, 'list'])->name('api.food-scan.list');
        Route::get('food-scan/{id}', [FoodScanController::class, 'show'])->name('api.food-scan.show');
        Route::put('food-scan/{id}', [FoodScanController::class, 'update'])->name('api.food-scan.update');
        Route::delete('food-scan/{id}', [FoodScanController::class, 'destroy'])->name('api.food-scan.destroy');
        Route::post('food-scan/{id}/correct', [FoodScanController::class, 'correct'])->name('api.food-scan.correct');
        Route::get('food-scans/stats', [FoodScanController::class, 'stats'])->name('api.food-scans.stats');
        Route::get('daily-summary', [FoodScanController::class, 'dailySummary'])->name('api.daily-summary');
        
        // Nutrition Analysis Routes
        Route::post('nutrition-analysis/analyze', [\App\Http\Controllers\NutritionAnalysisController::class, 'analyze'])->name('api.nutrition-analysis.analyze');
    });
});

require __DIR__.'/history.php';
require __DIR__.'/settings.php';