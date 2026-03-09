<?php

namespace App\Services;

use App\Models\FoodScan;
use App\Models\NutritionProfile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NutritionAnalysisService
{
    protected string $apiUrl;

    protected ?string $apiKey;

    protected string $model;

    /**
     * Available OpenRouter models in order of preference
     * Using text-only models for nutrition analysis (no vision needed)
     */
    protected array $availableModels = [
        'qwen/qwen-2.5-72b-instruct',
        'mistralai/mistral-small-3.1-24b-instruct:free',
        'qwen/qwen-2.5-32b-instruct',
        'google/gemma-2-27b-it:free',
        'meta-llama/llama-3.2-3b-instruct:free',
    ];

    public function __construct()
    {
        $this->apiUrl = config('services.openrouter.url', env('OPENROUTER_API_URL', 'https://openrouter.ai/api/v1'));
        $this->apiKey = config('services.openrouter.key', env('OPENROUTER_API_KEY'));
        
        $configuredModel = config('services.openrouter.model', env('OPENROUTER_MODEL'));
        
        if ($configuredModel && in_array($configuredModel, $this->availableModels)) {
            $this->model = $configuredModel;
        } else {
            $this->model = $this->availableModels[0];
        }
    }

    /**
     * Analyze comprehensive user nutrition with AI (all data)
     */
    public function analyzeDailyNutrition(int $userId, ?string $date = null): array
    {
        // Increase execution time limit for AI API calls
        set_time_limit(180); // 3 minutes
        
        // Get user nutrition profile
        $nutritionProfile = NutritionProfile::where('user_id', $userId)->first();

        // Get ALL food scans (not just today)
        $foodScans = FoodScan::where('user_id', $userId)
            ->orderBy('scanned_at', 'desc')
            ->get();

        // Calculate overall statistics
        $totalStats = $this->calculateOverallStats($foodScans);

        // Get recent food items (last 7 days)
        $recentFoodScans = FoodScan::where('user_id', $userId)
            ->where('scanned_at', '>=', now()->subDays(7))
            ->orderBy('scanned_at', 'desc')
            ->get();

        // Build context for AI
        $context = $this->buildAnalysisContext($totalStats, $nutritionProfile, $foodScans, $recentFoodScans);

        $prompt = $this->buildNutritionAnalysisPrompt($context);

            try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(120)->post($this->apiUrl.'/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'max_tokens' => 2048,
                'temperature' => 0.7,
            ]);

            if (! $response->successful()) {
                Log::error('Nutrition Analysis Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \Exception('Failed to analyze nutrition: '.$response->body());
            }

            $content = $response->json('choices.0.message.content');

            return $this->parseAnalysisResponse($content);

        } catch (\Exception $e) {
            Log::error('Nutrition Analysis Exception', [
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Calculate overall statistics from all food scans
     */
    protected function calculateOverallStats($foodScans): array
    {
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
            return $totalStats;
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

        return $totalStats;
    }

    /**
     * Build context for nutrition analysis
     */
    protected function buildAnalysisContext(array $totalStats, ?NutritionProfile $nutritionProfile, $allFoodScans, $recentFoodScans): array
    {
        $context = [
            'total_summary' => [
                'total_calories' => round($totalStats['total_calories'], 2),
                'total_protein' => round($totalStats['total_protein'], 2),
                'total_carbs' => round($totalStats['total_carbs'], 2),
                'total_fat' => round($totalStats['total_fat'], 2),
                'scan_count' => $totalStats['scan_count'],
                'average_daily_calories' => round($totalStats['average_daily_calories'], 2),
                'average_daily_protein' => round($totalStats['average_daily_protein'], 2),
                'average_daily_carbs' => round($totalStats['average_daily_carbs'], 2),
                'average_daily_fat' => round($totalStats['average_daily_fat'], 2),
            ],
            'user_profile' => $nutritionProfile ? [
                'age' => $nutritionProfile->age,
                'weight' => $nutritionProfile->weight,
                'height' => $nutritionProfile->height,
                'gender' => $nutritionProfile->gender,
                'bmr' => $this->calculateBMR($nutritionProfile),
                'daily_calorie_needs' => $this->calculateDailyCalorieNeeds($nutritionProfile),
            ] : null,
            'food_items' => $recentFoodScans->map(function ($scan) {
                return [
                    'food_name' => $scan->food_name,
                    'calories' => $scan->calories,
                    'protein' => $scan->protein,
                    'carbohydrates' => $scan->carbohydrates,
                    'fat' => $scan->fat,
                    'consumed_percentage' => $scan->consumed_percentage,
                    'scanned_at' => $scan->scanned_at->format('d/m/Y H:i'),
                ];
            })->toArray(),
        ];

        return $context;
    }

    /**
     * Calculate Basal Metabolic Rate (BMR)
     */
    protected function calculateBMR(NutritionProfile $profile): float
    {
        $age = $profile->age;
        $weight = $profile->weight; // kg
        $height = $profile->height; // cm

        if ($profile->gender === 'male' || $profile->gender === 'pria') {
            // Mifflin-St Jeor equation for men
            return (10 * $weight) + (6.25 * $height) - (5 * $age) + 5;
        } else {
            // Mifflin-St Jeor equation for women
            return (10 * $weight) + (6.25 * $height) - (5 * $age) - 161;
        }
    }

    /**
     * Calculate daily calorie needs (assuming sedentary lifestyle)
     */
    protected function calculateDailyCalorieNeeds(NutritionProfile $profile): float
    {
        $bmr = $this->calculateBMR($profile);
        
        // Assuming sedentary lifestyle (1.2 multiplier)
        return $bmr * 1.2;
    }

    /**
     * Build nutrition analysis prompt
     */
    protected function buildNutritionAnalysisPrompt(array $context): string
    {
        $profileInfo = $context['user_profile'] ? 
            sprintf(
                "- Usia: %d tahun\n- Berat Badan: %.1f kg\n- Tinggi Badan: %.1f cm\n- Gender: %s\n- Kebutuhan Kalori Harian: %.0f kcal\n- BMR (Basal Metabolic Rate): %.0f kcal",
                $context['user_profile']['age'],
                $context['user_profile']['weight'],
                $context['user_profile']['height'],
                $context['user_profile']['gender'],
                $context['user_profile']['daily_calorie_needs'],
                $context['user_profile']['bmr']
            ) : 
            "Profil nutrisi belum diisi pengguna.";

        $overallStats = sprintf(
            "- Total Makanan: %d catatan\n- Total Kalori: %.0f kcal\n- Total Protein: %.1f g\n- Total Karbohidrat: %.1f g\n- Total Lemak: %.1f g",
            $context['total_summary']['scan_count'],
            $context['total_summary']['total_calories'],
            $context['total_summary']['total_protein'],
            $context['total_summary']['total_carbs'],
            $context['total_summary']['total_fat']
        );

        $dailyAverage = sprintf(
            "- Rata-rata Kalori/Hari: %.0f kcal\n- Rata-rata Protein/Hari: %.1f g\n- Rata-rata Karbo/Hari: %.1f g\n- Rata-rata Lemak/Hari: %.1f g",
            $context['total_summary']['average_daily_calories'],
            $context['total_summary']['average_daily_protein'],
            $context['total_summary']['average_daily_carbs'],
            $context['total_summary']['average_daily_fat']
        );

        $foodList = empty($context['food_items']) ? 
            "Belum ada makanan yang dicatat." : 
            implode("\n", array_map(function ($item) {
                return sprintf(
                    "- %s (%s)\n  Kalori: %.0f kcal | Protein: %.1fg | Karbo: %.1fg | Lemak: %.1fg | Dimakan: %.0f%%",
                    $item['food_name'],
                    $item['scanned_at'],
                    $item['calories'],
                    $item['protein'],
                    $item['carbohydrates'],
                    $item['fat'],
                    $item['consumed_percentage']
                );
            }, array_slice($context['food_items'], 0, 20))); // Limit to 20 recent items

        return <<<PROMPT
Kamu adalah ahli nutrisi kesehatan yang berpengalaman. Analisis DATA LENGKAP nutrisi pengguna berikut dan berikan saran komprehensif yang bermanfaat.

PROFIL PENGGUNA:
{$profileInfo}

STATISTIK TOTAL (SEMUA DATA):
{$overallStats}

RATA-RATA HARIAN:
{$dailyAverage}

DAFTAR MAKANAN TERBARU (7 HARI TERAKHIR, MAKSIMAL 20 ITEM):
{$foodList}

TUGAS:
Analisis pola makan pengguna secara KOMPREHENSIF berdasarkan SEMUA data nutrisi yang tersedia, bukan hanya hari ini. Berikan:

1. SARAN UMUM: 2-3 paragraf tentang pola makan secara keseluruhan, apakah sudah seimbang atau perlu perbaikan jangka panjang

2. INFORMASI PENTING: Poin-poin penting yang perlu diketahui pengguna tentang pola nutrisi mereka secara menyeluruh (min 5 poin)

3. REKOMENDASI KESEHATAN: Saran spesifik untuk kesehatan berdasarkan data nutrisi komprehensif (min 5 rekomendasi)

4. STATUS NUTRISI: Penilaian status nutrisi secara menyeluruh (Baik/Cukup/Kurang) dengan penjelasan singkat

FORMAT OUTPUT:
Gunakan format berikut dalam bahasa Indonesia:

## Saran Pola Makan
[2-3 paragraf analisis pola makan secara keseluruhan berdasarkan semua data]

## Informasi Penting
• [Poin 1]
• [Poin 2]
• [Poin 3]
• [dst... hingga minimal 5 poin]

## Rekomendasi Kesehatan
• [Rekomendasi 1]
• [Rekomendasi 2]
• [Rekomendasi 3]
• [dst... hingga minimal 5 rekomendasi]

## Status Nutrisi: [Baik/Cukup/Kurang]
[Penjelasan singkat status nutrisi secara menyeluruh]

Catatan:
- Berikan saran yang praktis dan bisa diaplikasikan jangka panjang
- Jika profil nutrisi belum diisi, berikan saran umum yang masih bermanfaat
- Analisis berdasarkan semua data yang tersedia, tidak hanya hari ini
- Fokus pada pola nutrisi secara menyeluruh dan tren konsumsi
- Berikan saran yang edukatif dan informatif
- Gunakan bahasa Indonesia yang mudah dipahami
PROMPT;
    }

    /**
     * Parse analysis response from AI
     */
    protected function parseAnalysisResponse(string $content): array
    {
        // Extract sections from the response
        $analysis = [
            'general_advice' => '',
            'important_info' => [],
            'health_recommendations' => [],
            'nutrition_status' => '',
        ];

        // Extract general advice
        if (preg_match('/## Saran Pola Makan\s*(.*?)(?=##|$)/s', $content, $matches)) {
            $analysis['general_advice'] = trim($matches[1]);
        }

        // Extract important info
        if (preg_match('/## Informasi Penting\s*(.*?)(?=##|$)/s', $content, $matches)) {
            $infoText = trim($matches[1]);
            $points = preg_split('/•\s*/', $infoText);
            $analysis['important_info'] = array_filter(array_map('trim', $points));
        }

        // Extract health recommendations
        if (preg_match('/## Rekomendasi Kesehatan\s*(.*?)(?=##|$)/s', $content, $matches)) {
            $recText = trim($matches[1]);
            $points = preg_split('/•\s*/', $recText);
            $analysis['health_recommendations'] = array_filter(array_map('trim', $points));
        }

        // Extract nutrition status
        if (preg_match('/## Status Nutrisi:\s*(.*?)(?=\n|$)/s', $content, $matches)) {
            $analysis['nutrition_status'] = trim($matches[1]);
        }

        $analysis['raw_response'] = $content;

        return $analysis;
    }

    public function isConfigured(): bool
    {
        return ! empty($this->apiKey);
    }
}