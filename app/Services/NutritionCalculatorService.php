<?php

namespace App\Services;

class NutritionCalculatorService
{
    /**
     * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
     * 
     * @param int $age Age in years
     * @param float $weight Weight in kg
     * @param float $height Height in cm
     * @param string $gender 'male' or 'female'
     * @return float BMR in kcal
     */
    public function calculateBMR(int $age, float $weight, float $height, string $gender): float
    {
        $bmr = (10 * $weight) + (6.25 * $height) - (5 * $age);
        
        if ($gender === 'male') {
            $bmr += 5;
        } else {
            $bmr -= 161;
        }
        
        return round($bmr, 2);
    }

    /**
     * Calculate daily protein requirement
     * Based on 0.8-1.2g per kg of body weight
     * 
     * @param float $weight Weight in kg
     * @return float Protein in grams
     */
    public function calculateProtein(float $weight): float
    {
        // Use 1.0g per kg as a balanced baseline
        return round($weight * 1.0, 1);
    }

    /**
     * Calculate daily carbohydrate requirement
     * Based on 45-65% of total calories
     * 
     * @param float $bmr BMR in kcal
     * @return float Carbohydrates in grams
     */
    public function calculateCarbohydrates(float $bmr): float
    {
        // Use 50% of BMR as baseline
        $carbCalories = $bmr * 0.50;
        return round($carbCalories / 4, 1); // 4 calories per gram
    }

    /**
     * Calculate daily fat requirement
     * Based on 20-35% of total calories
     * 
     * @param float $bmr BMR in kcal
     * @return float Fat in grams
     */
    public function calculateFat(float $bmr): float
    {
        // Use 27% of BMR as baseline (balance between protein and carbs)
        $fatCalories = $bmr * 0.27;
        return round($fatCalories / 9, 1); // 9 calories per gram
    }

    /**
     * Calculate all daily nutrition targets
     * 
     * @param int $age Age in years
     * @param float $weight Weight in kg
     * @param float $height Height in cm
     * @param string $gender 'male' or 'female'
     * @return array
     */
    public function calculateDailyTargets(int $age, float $weight, float $height, string $gender): array
    {
        $bmr = $this->calculateBMR($age, $weight, $height, $gender);
        
        return [
            'calories' => round($bmr),
            'protein' => $this->calculateProtein($weight),
            'carbs' => $this->calculateCarbohydrates($bmr),
            'fat' => $this->calculateFat($bmr),
        ];
    }

    /**
     * Calculate progress percentage
     * 
     * @param float $consumed Amount consumed
     * @param float $target Target amount
     * @return float Percentage
     */
    public function calculateProgress(float $consumed, float $target): float
    {
        if ($target <= 0) return 0;
        return round(($consumed / $target) * 100, 1);
    }

    /**
     * Get status based on progress
     * 
     * @param float $progress Percentage
     * @return string 'under', 'optimal', 'over'
     */
    public function getStatus(float $progress): string
    {
        if ($progress < 80) return 'under';
        if ($progress <= 120) return 'optimal';
        return 'over';
    }

    /**
     * Get side effects information for excessive intake
     * 
     * @param string $nutrientType Type of nutrient (calories, protein, carbs, fat)
     * @return array Side effects information
     */
    public function getExcessSideEffects(string $nutrientType): array
    {
        $sideEffects = [
            'calories' => [
                'short_term' => [
                    'Kembung dan rasa tidak nyaman di perut',
                    'Merasa lelah dan lesu setelah makan',
                    'Kesulitan tidur (insomnia)',
                    'Sembelit atau diare',
                ],
                'long_term' => [
                    'Kenaikan berat badan yang berlebihan',
                    'Obesitas',
                    'Penyakit jantung dan pembuluh darah',
                    'Diabetes tipe 2',
                    'Tekanan darah tinggi (hipertensi)',
                    'Kolesterol tinggi',
                    'Penyakit hati berlemak (fatty liver)',
                    'Gangguan pernapasan saat tidur (sleep apnea)',
                    'Nyeri sendi (osteoarthritis)',
                ],
                'recommendations' => [
                    'Kurangi porsi makan dan makan lebih perlahan',
                    'Pilih makanan yang lebih rendah kalori',
                    'Tingkatkan aktivitas fisik dan olahraga',
                    'Perbanyak konsumsi sayuran dan buah-buahan',
                    'Hindari minuman manis dan makanan tinggi lemak',
                ],
            ],
            'protein' => [
                'short_term' => [
                    'Dehidrasi karena tubuh membutuhkan lebih banyak air untuk memproses protein',
                    'Kembung dan gas berlebih',
                    'Sembelit (jika kurang serat)',
                    'Rasa lelah dan lemah',
                ],
                'long_term' => [
                    'Gangguan fungsi ginjal dan kerusakan ginjal',
                    'Penyakit batu ginjal',
                    'Osteoporosis (tulang rapuh) karena kalsium ditarik dari tulang',
                    'Gangguan hati',
                    'Penyakit kardiovaskular',
                    'Kanker usus besar',
                    'Defisiensi nutrisi lain karena kurang variatifnya makanan',
                ],
                'recommendations' => [
                    'Batasi asupan protein sesuai kebutuhan tubuh',
                    'Perbanyak konsumsi air putih',
                    'Pastikan mendapatkan cukup serat dari sayuran dan buah',
                    'Pilih sumber protein yang seimbang (hewani dan nabati)',
                    'Konsultasikan dengan ahli gizi jika punya kondisi medis tertentu',
                ],
            ],
            'carbs' => [
                'short_term' => [
                    'Kenaikan gula darah yang cepat (spike)',
                    'Rasa lapar kembali setelah beberapa waktu',
                    'Lemas dan mudah lelah',
                    'Sering buang air kecil',
                ],
                'long_term' => [
                    'Diabetes tipe 2',
                    'Resistensi insulin',
                    'Kenaikan berat badan',
                    'Penyakit jantung',
                    'Peradangan kronis dalam tubuh',
                    'Gangguan kognitif dan daya ingat menurun',
                    'Penyakit periodontal (masalah gusi)',
                    'Gangguan mood dan kecemasan',
                ],
                'recommendations' => [
                    'Pilih karbohidrat kompleks (gandum utuh, nasi merah, oat)',
                    'Batasi gula dan karbohidrat sederhana',
                    'Perbanyak serat dari buah dan sayuran',
                    'Gunakan metode piring sehat (separuh sayur, seperempat karbo, seperempat protein)',
                    'Perhatikan indeks glikemik makanan yang dikonsumsi',
                ],
            ],
            'fat' => [
                'short_term' => [
                    'Rasa kembung dan berat di perut',
                    'Mual dan ingin muntah',
                    'Diare atau gangguan pencernaan',
                    'Rasa tidak nyaman dan lesu',
                ],
                'long_term' => [
                    'Obesitas',
                    'Penyakit jantung koroner',
                    'Stroke',
                    'Kolesterol tinggi (LDL)',
                    'Penyempitan pembuluh darah (aterosklerosis)',
                    'Penyakit hati berlemak',
                    'Penyakit pankreas (pankreatitis)',
                    'Gangguan empedu (batu empedu)',
                    'Resiko kanker tertentu (payudara, usus, prostat)',
                ],
                'recommendations' => [
                    'Ganti lemak jenuh dengan lemak tak jenuh (alpukat, kacang-kacangan, minyak zaitun)',
                    'Hindari makanan goreng dan fast food',
                    'Baca label nutrisi dan perhatikan kandungan lemak',
                    'Pilih metode memasak yang lebih sehat (rebus, kukus, panggang)',
                    'Batasi konsumsi daging merah dan olahan',
                ],
            ],
        ];

        return $sideEffects[$nutrientType] ?? [];
    }

    /**
     * Get fulfillment message when nutrient target is met
     * 
     * @param string $nutrientType Type of nutrient
     * @return array Fulfillment information
     */
    public function getFulfillmentMessage(string $nutrientType): array
    {
        $messages = [
            'calories' => [
                'title' => 'Target Kalori Terpenuhi!',
                'message' => 'Selamat! Anda telah mencapai target kalori harian Anda. Tubuh Anda memiliki energi yang cukup untuk mendukung aktivitas sehari-hari.',
                'benefits' => [
                    'Energi optimal untuk beraktivitas',
                    'Mendukung fungsi organ vital',
                    'Mencegah kelelahan dan lemas',
                    'Mendukung pemulihan tubuh',
                ],
            ],
            'protein' => [
                'title' => 'Target Protein Terpenuhi!',
                'message' => 'Hebat! Asupan protein hari ini sudah cukup untuk memenuhi kebutuhan tubuh Anda dalam membangun dan memperbaiki jaringan.',
                'benefits' => [
                    'Mendukung pertumbuhan dan perbaikan otot',
                    'Menguatkan sistem kekebalan tubuh',
                    'Menjaga kesehatan rambut dan kulit',
                    'Membantu produksi enzim dan hormon',
                ],
            ],
            'carbs' => [
                'title' => 'Target Karbohidrat Terpenuhi!',
                'message' => 'Bagus! Asupan karbohidrat Anda sudah mencukupi untuk memberikan energi utama bagi otak dan tubuh.',
                'benefits' => [
                    'Energi utama untuk otak dan tubuh',
                    'Menjaga fungsi kognitif optimal',
                    'Mencegah pemecahan protein untuk energi',
                    'Menyimpan energi dalam bentuk glikogen',
                ],
            ],
            'fat' => [
                'title' => 'Target Lemak Terpenuhi!',
                'message' => 'Sempurna! Asupan lemak Anda sudah mencukupi untuk berbagai fungsi penting dalam tubuh.',
                'benefits' => [
                    'Menyerap vitamin A, D, E, dan K',
                    'Membangun membran sel',
                    'Melindungi organ vital',
                    'Mendukung produksi hormon penting',
                ],
            ],
        ];

        return $messages[$nutrientType] ?? [];
    }
}
