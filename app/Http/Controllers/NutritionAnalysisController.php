<?php

namespace App\Http\Controllers;

use App\Services\NutritionAnalysisService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NutritionAnalysisController extends Controller
{
    protected NutritionAnalysisService $analysisService;

    public function __construct(NutritionAnalysisService $analysisService)
    {
        $this->analysisService = $analysisService;
    }

    /**
     * Analyze daily nutrition with AI
     */
    public function analyze(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'nullable|date',
        ]);

        try {
            if (! $this->analysisService->isConfigured()) {
                return response()->json([
                    'error' => 'Layanan AI belum dikonfigurasi',
                ], 500);
            }

            $userId = auth()->id();
            $date = $request->input('date');

            $analysis = $this->analysisService->analyzeDailyNutrition($userId, $date);

            return response()->json([
                'success' => true,
                'data' => $analysis,
            ]);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'error' => 'Gagal terhubung ke layanan AI. Periksa koneksi internet Anda.',
            ], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            return response()->json([
                'error' => 'Terjadi kesalahan saat memproses permintaan AI. Silakan coba lagi.',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal menganalisis nutrisi: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get analysis page
     */
    public function index()
    {
        return inertia('analysis');
    }
}