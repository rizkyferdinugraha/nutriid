<?php

namespace App\Http\Controllers;

use App\Models\DailySummary;
use App\Models\FoodScan;
use App\Models\NutritionProfile;
use App\Services\AIService;
use App\Services\NutritionCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FoodScanController extends Controller
{
    public function __construct(
        protected AIService $aiService,
        protected NutritionCalculatorService $nutritionCalculator
    ) {}

    /**
     * Display the scan page
     */
    public function scan(): Response
    {
        return Inertia::render('scan');
    }

    /**
     * Display the history page with initial data
     */
    public function history(): Response
    {
        $scans = FoodScan::where('user_id', Auth::id())
            ->orderBy('scanned_at', 'desc')
            ->get()
            ->map(function ($scan) {
                return [
                    'id' => $scan->id,
                    'food_name' => $scan->food_name,
                    'description' => $scan->description,
                    'calories' => $scan->calories,
                    'protein' => $scan->protein,
                    'carbohydrates' => $scan->carbohydrates,
                    'fat' => $scan->fat,
                    'fiber' => $scan->fiber,
                    'sugar' => $scan->sugar,
                    'sodium' => $scan->sodium,
                    'serving_size' => $scan->serving_size,
                    'confidence_score' => $scan->confidence_score,
                    'consumed_percentage' => $scan->consumed_percentage,
                    'image_url' => $scan->getThumbnailUrl(),
                    'scanned_at' => $scan->scanned_at->toISOString(),
                    'scan_status' => $scan->scan_status,
                ];
            });

        return Inertia::render('history', [
            'initialScans' => $scans,
        ]);
    }

    /**
     * Store a newly scanned food
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:10240'], // 10MB max
            'consumed_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        if (! $this->aiService->isConfigured()) {
            return response()->json([
                'error' => 'AI service is not configured. Please set CHUTES_API_KEY in your environment.',
            ], 500);
        }

        try {
            // Analyze the image with AI
            $nutritionData = $this->aiService->analyzeFoodImage($request->file('image'));

            // Store the image
            $imagePath = $request->file('image')->store('food-scans/'.Auth::id(), 'public');

            // Create the food scan record
            $foodScan = FoodScan::create([
                'user_id' => Auth::id(),
                'image_path' => $imagePath,
                'food_name' => $nutritionData['food_name'],
                'description' => $nutritionData['description'] ?? null,
                'calories' => $nutritionData['calories'],
                'protein' => $nutritionData['protein'],
                'carbohydrates' => $nutritionData['carbohydrates'],
                'fat' => $nutritionData['fat'],
                'fiber' => $nutritionData['fiber'] ?? null,
                'sugar' => $nutritionData['sugar'] ?? null,
                'sodium' => $nutritionData['sodium'] ?? null,
                'serving_size' => $nutritionData['serving_size'] ?? null,
                'confidence_score' => $nutritionData['confidence_score'] ?? null,
                'raw_response' => $nutritionData['raw_response'] ?? null,
                'consumed_percentage' => $request->input('consumed_percentage', 0),
                'scanned_at' => now(),
                'scan_status' => $nutritionData['scan_status'] ?? 'success',
            ]);

            // Update daily summary
            $dailySummary = DailySummary::getOrCreateForUser(Auth::id());
            $dailySummary->addScan($foodScan);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $foodScan->id,
                    'food_name' => $foodScan->food_name,
                    'description' => $foodScan->description,
                    'calories' => $foodScan->calories,
                    'protein' => $foodScan->protein,
                    'carbohydrates' => $foodScan->carbohydrates,
                    'fat' => $foodScan->fat,
                    'fiber' => $foodScan->fiber,
                    'sugar' => $foodScan->sugar,
                    'sodium' => $foodScan->sodium,
                    'serving_size' => $foodScan->serving_size,
                    'confidence_score' => $foodScan->confidence_score,
                    'consumed_percentage' => $foodScan->consumed_percentage,
                    'image_url' => $foodScan->getThumbnailUrl(),
                    'scanned_at' => $foodScan->scanned_at->toISOString(),
                    'scan_status' => $foodScan->scan_status,
                ],
            ]);

        } catch (\Exception $e) {
            $errorMessage = 'Failed to analyze food image: '.$e->getMessage();
            
            // Provide user-friendly message for timeout
            if (str_contains($e->getMessage(), 'timeout') || str_contains($e->getMessage(), 'execution time')) {
                $errorMessage = 'Waktu analisis habis. API AI memerlukan waktu lebih lama untuk merespons. Silakan coba lagi atau gunakan gambar yang lebih kecil.';
            }
            
            Log::error('Food scan analysis failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => $errorMessage,
            ], 500);
        }
    }

    /**
     * Get list of user's food scans
     */
    public function list(Request $request): JsonResponse
    {
        $query = FoodScan::where('user_id', Auth::id())
            ->orderBy('scanned_at', 'desc');

        if ($request->has('date')) {
            $query->whereDate('scanned_at', $request->date);
        }

        if ($request->has('limit')) {
            $query->limit($request->limit);
        }

        $scans = $query->get()->map(function ($scan) {
            return [
                'id' => $scan->id,
                'food_name' => $scan->food_name,
                'description' => $scan->description,
                'calories' => $scan->calories,
                'protein' => $scan->protein,
                'carbohydrates' => $scan->carbohydrates,
                'fat' => $scan->fat,
                'fiber' => $scan->fiber,
                'sugar' => $scan->sugar,
                'sodium' => $scan->sodium,
                'serving_size' => $scan->serving_size,
                'confidence_score' => $scan->confidence_score,
                'consumed_percentage' => $scan->consumed_percentage,
                'image_url' => $scan->getThumbnailUrl(),
                'scanned_at' => $scan->scanned_at->toISOString(),
                'scan_status' => $scan->scan_status,
            ];
        });

        return response()->json(['data' => $scans]);
    }

    /**
     * Get a specific food scan
     */
    public function show(string $id): JsonResponse
    {
        $scan = FoodScan::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $scan->id,
                'food_name' => $scan->food_name,
                'description' => $scan->description,
                'calories' => $scan->calories,
                'protein' => $scan->protein,
                'carbohydrates' => $scan->carbohydrates,
                'fat' => $scan->fat,
                'fiber' => $scan->fiber,
                'sugar' => $scan->sugar,
                'sodium' => $scan->sodium,
                'serving_size' => $scan->serving_size,
                'confidence_score' => $scan->confidence_score,
                'consumed_percentage' => $scan->consumed_percentage,
                'image_url' => $scan->getThumbnailUrl(),
                'scanned_at' => $scan->scanned_at->toISOString(),
                'scan_status' => $scan->scan_status,
            ],
        ]);
    }

    /**
     * Update consumed percentage of a food scan
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'consumed_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $scan = FoodScan::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $oldPercentage = (float) $scan->consumed_percentage;
        $newPercentage = (float) $request->input('consumed_percentage');

        $scan->consumed_percentage = $newPercentage;
        $scan->save();

        // Update daily summary
        $dailySummary = DailySummary::where('user_id', Auth::id())
            ->where('date', $scan->scanned_at->toDateString())
            ->first();

        if ($dailySummary) {
            $dailySummary->updateScan($scan, $oldPercentage);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $scan->id,
                'consumed_percentage' => $scan->consumed_percentage,
            ],
        ]);
    }

    /**
     * Delete a food scan
     */
    public function destroy(string $id): JsonResponse
    {
        $scan = FoodScan::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        // Update daily summary
        $dailySummary = DailySummary::where('user_id', Auth::id())
            ->where('date', $scan->scanned_at->toDateString())
            ->first();

        if ($dailySummary) {
            $dailySummary->removeScan($scan);
        }

        // Delete image
        if ($scan->image_path) {
            Storage::disk('public')->delete($scan->image_path);
        }

        $scan->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Get overall nutrition statistics for all user data
     */
    public function stats(Request $request): JsonResponse
    {
        $foodScans = FoodScan::where('user_id', Auth::id())
            ->orderBy('scanned_at', 'desc')
            ->get();

        $totalStats = [
            'total_calories' => 0,
            'total_protein' => 0,
            'total_carbs' => 0,
            'total_fat' => 0,
            'scan_count' => $foodScans->count(),
            'average_daily_calories' => 0,
            'average_daily_protein' => 0,
            'average_daily_carbs' => 0,
            'average_daily_fat' => 0,
        ];

        if ($foodScans->isEmpty()) {
            return response()->json($totalStats);
        }

        foreach ($foodScans as $scan) {
            $percentage = $scan->consumed_percentage / 100;
            $totalStats['total_calories'] += $scan->calories * $percentage;
            $totalStats['total_protein'] += $scan->protein * $percentage;
            $totalStats['total_carbs'] += $scan->carbohydrates * $percentage;
            $totalStats['total_fat'] += $scan->fat * $percentage;
        }

        // Calculate days span
        $firstScan = $foodScans->last();
        $lastScan = $foodScans->first();
        $daysSpan = $firstScan->scanned_at->diffInDays($lastScan->scanned_at) + 1;
        
        // Calculate daily averages
        if ($daysSpan > 0) {
            $totalStats['average_daily_calories'] = $totalStats['total_calories'] / $daysSpan;
            $totalStats['average_daily_protein'] = $totalStats['total_protein'] / $daysSpan;
            $totalStats['average_daily_carbs'] = $totalStats['total_carbs'] / $daysSpan;
            $totalStats['average_daily_fat'] = $totalStats['total_fat'] / $daysSpan;
        }

        return response()->json($totalStats);
    }

    /**
     * Get daily summary with personalized nutrition targets
     */
    public function dailySummary(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());

        $summary = DailySummary::where('user_id', Auth::id())
            ->where('date', $date)
            ->first();

        // Get nutrition profile
        $nutritionProfile = NutritionProfile::where('user_id', Auth::id())->first();
        $targets = null;

        // Calculate personalized targets if nutrition profile exists
        if ($nutritionProfile && $nutritionProfile->age && $nutritionProfile->weight && $nutritionProfile->height && $nutritionProfile->gender) {
            $targets = $this->nutritionCalculator->calculateDailyTargets(
                $nutritionProfile->age,
                $nutritionProfile->weight,
                $nutritionProfile->height,
                $nutritionProfile->gender
            );
        }

        if (! $summary) {
            return response()->json([
                'data' => [
                    'date' => $date,
                    'total_calories' => 0,
                    'total_protein' => 0,
                    'total_carbs' => 0,
                    'total_fat' => 0,
                    'scan_count' => 0,
                    'targets' => $targets,
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'date' => $summary->date->toDateString(),
                'total_calories' => $summary->total_calories,
                'total_protein' => $summary->total_protein,
                'total_carbs' => $summary->total_carbs,
                'total_fat' => $summary->total_fat,
                'scan_count' => $summary->scan_count,
                'targets' => $targets,
            ],
        ]);
    }

    /**
     * Correct food name and re-analyze
     */
    public function correct(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'corrected_food_name' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $scan = FoodScan::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        if (! $scan->image_path) {
            return response()->json([
                'error' => 'Image not found for this scan',
            ], 404);
        }

        if (! $this->aiService->isConfigured()) {
            return response()->json([
                'error' => 'AI service is not configured. Please set CHUTES_API_KEY in your environment.',
            ], 500);
        }

        try {
            // Get the original image from storage
            $imagePath = Storage::disk('public')->path($scan->image_path);
            
            if (! file_exists($imagePath)) {
                return response()->json([
                    'error' => 'Image file not found',
                ], 404);
            }

            // Create UploadedFile from the stored image
            $file = new \Illuminate\Http\UploadedFile(
                $imagePath,
                basename($imagePath),
                mime_content_type($imagePath),
                null,
                true
            );

            // Re-analyze with corrected food name
            $nutritionData = $this->aiService->analyzeFoodImageWithCorrectedName($file, $request->input('corrected_food_name'));

            // Store old actual nutrition values (considering consumed_percentage)
            $percentage = $scan->consumed_percentage / 100;
            $oldValues = [
                'calories' => $scan->calories * $percentage,
                'protein' => $scan->protein * $percentage,
                'carbohydrates' => $scan->carbohydrates * $percentage,
                'fat' => $scan->fat * $percentage,
            ];

            // Update the scan with corrected data
            $scan->update([
                'food_name' => $nutritionData['food_name'],
                'description' => $nutritionData['description'] ?? null,
                'calories' => $nutritionData['calories'],
                'protein' => $nutritionData['protein'],
                'carbohydrates' => $nutritionData['carbohydrates'],
                'fat' => $nutritionData['fat'],
                'fiber' => $nutritionData['fiber'] ?? null,
                'sugar' => $nutritionData['sugar'] ?? null,
                'sodium' => $nutritionData['sodium'] ?? null,
                'serving_size' => $nutritionData['serving_size'] ?? null,
                'confidence_score' => $nutritionData['confidence_score'] ?? null,
                'raw_response' => $nutritionData['raw_response'] ?? null,
                'scan_status' => $nutritionData['scan_status'] ?? 'success',
            ]);

            // Update daily summary
            $dailySummary = DailySummary::where('user_id', Auth::id())
                ->where('date', $scan->scanned_at->toDateString())
                ->first();

            if ($dailySummary) {
                // Calculate new actual nutrition values (considering consumed_percentage)
                $newValues = $scan->getActualNutrition();
                
                // Remove old values and add new values
                $dailySummary->total_calories = $dailySummary->total_calories - $oldValues['calories'] + $newValues['calories'];
                $dailySummary->total_protein = $dailySummary->total_protein - $oldValues['protein'] + $newValues['protein'];
                $dailySummary->total_carbs = $dailySummary->total_carbs - $oldValues['carbohydrates'] + $newValues['carbohydrates'];
                $dailySummary->total_fat = $dailySummary->total_fat - $oldValues['fat'] + $newValues['fat'];
                $dailySummary->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Food name corrected successfully',
                'data' => [
                    'id' => $scan->id,
                    'food_name' => $scan->food_name,
                    'description' => $scan->description,
                    'calories' => $scan->calories,
                    'protein' => $scan->protein,
                    'carbohydrates' => $scan->carbohydrates,
                    'fat' => $scan->fat,
                    'fiber' => $scan->fiber,
                    'sugar' => $scan->sugar,
                    'sodium' => $scan->sodium,
                    'serving_size' => $scan->serving_size,
                    'confidence_score' => $scan->confidence_score,
                    'consumed_percentage' => $scan->consumed_percentage,
                    'image_url' => $scan->getThumbnailUrl(),
                    'scanned_at' => $scan->scanned_at->toISOString(),
                    'scan_status' => $scan->scan_status,
                ],
            ]);

        } catch (\Exception $e) {
            $errorMessage = 'Failed to correct food name: '.$e->getMessage();
            
            // Provide user-friendly message for timeout
            if (str_contains($e->getMessage(), 'timeout') || str_contains($e->getMessage(), 'execution time')) {
                $errorMessage = 'Waktu analisis habis. API AI memerlukan waktu lebih lama untuk merespons. Silakan coba lagi.';
            }
            
            Log::error('Food name correction failed', [
                'user_id' => Auth::id(),
                'scan_id' => $id,
                'corrected_name' => $request->input('corrected_food_name'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => $errorMessage,
            ], 500);
        }
    }
}
