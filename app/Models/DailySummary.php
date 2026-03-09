<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailySummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'total_calories',
        'total_protein',
        'total_carbs',
        'total_fat',
        'scan_count',
    ];

    protected $casts = [
        'date' => 'date',
        'total_calories' => 'decimal:2',
        'total_protein' => 'decimal:2',
        'total_carbs' => 'decimal:2',
        'total_fat' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getOrCreateForUser(string $userId, $date = null): self
    {
        $date = $date ?? now()->toDateString();

        return self::firstOrCreate(
            ['user_id' => $userId, 'date' => $date],
            [
                'total_calories' => 0,
                'total_protein' => 0,
                'total_carbs' => 0,
                'total_fat' => 0,
                'scan_count' => 0,
            ]
        );
    }

    public function addScan(FoodScan $scan): void
    {
        $nutrition = $scan->getActualNutrition();
        $this->increment('total_calories', $nutrition['calories']);
        $this->increment('total_protein', $nutrition['protein']);
        $this->increment('total_carbs', $nutrition['carbohydrates']);
        $this->increment('total_fat', $nutrition['fat']);
        $this->increment('scan_count');
    }

    public function removeScan(FoodScan $scan): void
    {
        $nutrition = $scan->getActualNutrition();
        $this->decrement('total_calories', $nutrition['calories']);
        $this->decrement('total_protein', $nutrition['protein']);
        $this->decrement('total_carbs', $nutrition['carbohydrates']);
        $this->decrement('total_fat', $nutrition['fat']);
        $this->decrement('scan_count');
    }

    public function updateScan(FoodScan $scan, float $oldPercentage): void
    {
        $oldNutrition = [
            'calories' => $scan->calories * ($oldPercentage / 100),
            'protein' => $scan->protein * ($oldPercentage / 100),
            'carbohydrates' => $scan->carbohydrates * ($oldPercentage / 100),
            'fat' => $scan->fat * ($oldPercentage / 100),
        ];

        $newNutrition = $scan->getActualNutrition();

        $this->decrement('total_calories', $oldNutrition['calories']);
        $this->decrement('total_protein', $oldNutrition['protein']);
        $this->decrement('total_carbs', $oldNutrition['carbohydrates']);
        $this->decrement('total_fat', $oldNutrition['fat']);

        $this->increment('total_calories', $newNutrition['calories']);
        $this->increment('total_protein', $newNutrition['protein']);
        $this->increment('total_carbs', $newNutrition['carbohydrates']);
        $this->increment('total_fat', $newNutrition['fat']);
    }
}