<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AIService
{
    protected string $apiUrl;

    protected ?string $apiKey;

    protected string $model;

    /**
     * Available OpenRouter models in order of preference
     */
    protected array $availableModels = [
        'qwen/qwen3-vl-235b-a22b-thinking',
        'mistralai/mistral-small-3.1-24b-instruct:free',
        'qwen/qwen3-vl-30b-a3b-thinking',
        'nvidia/nemotron-nano-12b-v2-vl:free',
        'bytedance-seed/seedream-4.5',
    ];

    public function __construct()
    {
        $this->apiUrl = config('services.openrouter.url', env('OPENROUTER_API_URL', 'https://openrouter.ai/api/v1'));
        $this->apiKey = config('services.openrouter.key', env('OPENROUTER_API_KEY'));
        
        // Get model from config or use the first available model as default
        $configuredModel = config('services.openrouter.model', env('OPENROUTER_MODEL'));
        
        if ($configuredModel && in_array($configuredModel, $this->availableModels)) {
            $this->model = $configuredModel;
        } else {
            $this->model = $this->availableModels[0];
        }
    }

    public function analyzeFoodImage(UploadedFile $image): array
    {
        // Store image temporarily for analysis
        $imageData = base64_encode($image->get());
        $mimeType = $image->getMimeType();

        $prompt = $this->buildNutritionPrompt();

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->apiUrl.'/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => $prompt,
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:{$mimeType};base64,{$imageData}",
                                ],
                            ],
                        ],
                    ],
                ],
                'max_tokens' => 1024,
                'temperature' => 0.3,
            ]);

            if (! $response->successful()) {
                Log::error('AI Service Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \Exception('Failed to analyze image: '.$response->body());
            }

            $content = $response->json('choices.0.message.content');

            return $this->parseNutritionResponse($content);

        } catch (\Exception $e) {
            Log::error('AI Service Exception', [
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function buildNutritionPrompt(): string
    {
        return <<<'PROMPT'
You are a nutrition expert with extensive knowledge of Indonesian cuisine. Analyze this food image and provide nutritional information.

CRITICAL: This is an Indonesian context. You MUST be aware of and properly identify Indonesian local foods from all regions. Do not mistake Indonesian dishes for other cuisines.

IMPORTANT GUIDELINES FOR INDONESIAN FOOD IDENTIFICATION:
1. Recognize common Indonesian dishes: Nasi Goreng, Mie Goreng, Sate, Rendang, Gado-gado, Soto, Bakso, Martabak, Klepon, Lemper, Ongol-ongol, Es Teler, Es Campur, etc.
2. Be aware of regional variations: Padang food (Rendang, Gulai, Sate Padang), Javanese food (Gudeg, Tumpeng, Rawon), Sundanese food (Lalapan, Pepes, Karedok), Betawi food (Kerak Telor, Soto Betawi), etc.
3. Identify traditional Indonesian ingredients: Bumbu rempah, santan, tempeh, tahu, petis, krupuk, sambal, daun kemangi, daun jeruk, serai, jahe, lengkuas, kunyit, etc.
4. Recognize Indonesian snacks and desserts: Kue lapis, Bolu kukus, Nagasari, Dadar gulung, Klepon, Onde-onde, Serabi, Es krim goreng, Pisang goreng, Bakwan, Tahu isi, etc.
5. Pay attention to Indonesian cooking methods: Dihidangkan dengan sambal, disajikan dengan lalapan, dibakar, digoreng, dikukus, dibumbui rempah, etc.

IMPORTANT: You must respond in valid JSON format only. No other text before or after the JSON.

Return a JSON object with these exact fields:
{
    "food_name": "Name of the food in Indonesian (use the correct Indonesian name, not English translation)",
    "description": "Complete and detailed description in Indonesian (3-5 sentences) that includes: what type of food it is, main ingredients, cooking method if visible, appearance characteristics, and any notable features. Be specific and informative.",
    "calories": number (estimated calories in kcal),
    "protein": number (protein in grams),
    "carbohydrates": number (carbs in grams),
    "fat": number (fat in grams),
    "fiber": number (fiber in grams, estimate if unknown),
    "sugar": number (sugar in grams, estimate if unknown),
    "sodium": number (sodium in mg, estimate if unknown),
    "serving_size": "Estimated serving size (e.g., '1 piring', '100g')",
    "confidence_score": number (0-100, how confident you are in the identification)
}

If you cannot identify the food, still provide your best estimate with a lower confidence_score.
If there are multiple foods, identify the main dish and describe all visible items.

The description must be comprehensive and informative. For example:
"Nasi goreng spesial dengan telur dadar, potongan ayam, dan sayuran segar. Dihidangkan dengan irisan timun dan tomat sebagai pelengkap. Masakan ini menggunakan bumbu rempah yang kaya dengan warna cokelat keemasan. Teksturnya gurih dengan aroma yang menggugah selera."

Respond with ONLY the JSON object, no markdown formatting.
PROMPT;
    }

    protected function parseNutritionResponse(string $content): array
    {
        // Try to extract JSON from the response
        $jsonMatch = null;

        // Try to find JSON in code blocks first
        if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $content, $matches)) {
            $jsonMatch = $matches[1];
        } else {
            // Try to find raw JSON object
            if (preg_match('/\{[\s\S]*\}/m', $content, $matches)) {
                $jsonMatch = $matches[0];
            }
        }

        if (! $jsonMatch) {
            throw new \Exception('Could not parse nutrition data from AI response');
        }

        $data = json_decode(trim($jsonMatch), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON in AI response: '.json_last_error_msg());
        }

        // Validate required fields
        $required = ['food_name', 'calories', 'protein', 'carbohydrates', 'fat'];
        foreach ($required as $field) {
            if (! isset($data[$field])) {
                $data[$field] = $field === 'food_name' ? 'Unknown Food' : 0;
            }
        }

        // Ensure numeric values
        $numericFields = ['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium', 'confidence_score'];
        foreach ($numericFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = floatval($data[$field]);
            }
        }

        // Determine scan status based on confidence score
        // If confidence is very low (< 30), mark as failed
        if (isset($data['confidence_score']) && $data['confidence_score'] < 30) {
            $data['scan_status'] = 'failed';
        } else {
            $data['scan_status'] = 'success';
        }

        $data['raw_response'] = $content;

        return $data;
    }

    public function isConfigured(): bool
    {
        return ! empty($this->apiKey);
    }

    /**
     * Re-analyze food image with user-provided food name correction
     */
    public function analyzeFoodImageWithCorrectedName(UploadedFile $image, string $correctedFoodName): array
    {
        // Store image temporarily for analysis
        $imageData = base64_encode($image->get());
        $mimeType = $image->getMimeType();

        $prompt = $this->buildNutritionPromptWithCorrection($correctedFoodName);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->apiUrl.'/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => $prompt,
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:{$mimeType};base64,{$imageData}",
                                ],
                            ],
                        ],
                    ],
                ],
                'max_tokens' => 1024,
                'temperature' => 0.3,
            ]);

            if (! $response->successful()) {
                Log::error('AI Service Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \Exception('Failed to analyze image: '.$response->body());
            }

            $content = $response->json('choices.0.message.content');

            return $this->parseNutritionResponse($content);

        } catch (\Exception $e) {
            Log::error('AI Service Exception', [
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function buildNutritionPromptWithCorrection(string $correctedFoodName): string
    {
        return <<<PROMPT
You are a nutrition expert with extensive knowledge of Indonesian cuisine. The user has provided the correct food name for this image.

IMPORTANT: The user has identified this food as: "{$correctedFoodName}"

Use this corrected name as the definitive food identification. Provide accurate nutritional information based on this specific food name.

CRITICAL: This is an Indonesian context. Use your extensive knowledge of Indonesian cuisine to provide accurate nutritional data for this food.

IMPORTANT GUIDELINES FOR INDONESIAN FOOD NUTRITION:
1. Recognize common Indonesian dishes: Nasi Goreng, Mie Goreng, Sate, Rendang, Gado-gado, Soto, Bakso, Martabak, Klepon, Lemper, Ongol-ongol, Es Teler, Es Campur, etc.
2. Be aware of regional variations: Padang food (Rendang, Gulai, Sate Padang), Javanese food (Gudeg, Tumpeng, Rawon), Sundanese food (Lalapan, Pepes, Karedok), Betawi food (Kerak Telor, Soto Betawi), etc.
3. Identify traditional Indonesian ingredients: Bumbu rempah, santan, tempeh, tahu, petis, krupuk, sambal, daun kemangi, daun jeruk, serai, jahe, lengkuas, kunyit, etc.
4. Recognize Indonesian snacks and desserts: Kue lapis, Bolu kukus, Nagasari, Dadar gulung, Klepon, Onde-onde, Serabi, Es krim goreng, Pisang goreng, Bakwan, Tahu isi, etc.
5. Pay attention to Indonesian cooking methods: Dihidangkan dengan sambal, disajikan dengan lalapan, dibakar, digoreng, dikukus, dibumbui rempah, etc.

IMPORTANT: You must respond in valid JSON format only. No other text before or after the JSON.

Return a JSON object with these exact fields:
{
    "food_name": "{$correctedFoodName}",
    "description": "Complete and detailed description in Indonesian (3-5 sentences) that includes: what type of food it is, main ingredients, cooking method if visible, appearance characteristics, and any notable features. Be specific and informative.",
    "calories": number (estimated calories in kcal),
    "protein": number (protein in grams),
    "carbohydrates": number (carbs in grams),
    "fat": number (fat in grams),
    "fiber": number (fiber in grams, estimate if unknown),
    "sugar": number (sugar in grams, estimate if unknown),
    "sodium": number (sodium in mg, estimate if unknown),
    "serving_size": "Estimated serving size (e.g., '1 piring', '100g')",
    "confidence_score": number (90-100, since user provided correct name)
}

The description must be comprehensive and informative. For example:
"Nasi goreng spesial dengan telur dadar, potongan ayam, dan sayuran segar. Dihidangkan dengan irisan timun dan tomat sebagai pelengkap. Masakan ini menggunakan bumbu rempah yang kaya dengan warna cokelat keemasan. Teksturnya gurih dengan aroma yang menggugah selera."

Respond with ONLY the JSON object, no markdown formatting.
PROMPT;
    }
}
