<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FoodScan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'image_path',
        'food_name',
        'description',
        'calories',
        'protein',
        'carbohydrates',
        'fat',
        'fiber',
        'sugar',
        'sodium',
        'serving_size',
        'confidence_score',
        'raw_response',
        'consumed_percentage',
        'scanned_at',
        'scan_status',
    ];

    protected $casts = [
        'calories' => 'decimal:2',
        'protein' => 'decimal:2',
        'carbohydrates' => 'decimal:2',
        'fat' => 'decimal:2',
        'fiber' => 'decimal:2',
        'sugar' => 'decimal:2',
        'sodium' => 'decimal:2',
        'confidence_score' => 'decimal:2',
        'raw_response' => 'array',
        'consumed_percentage' => 'decimal:2',
        'scanned_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getThumbnailUrl(): string
    {
        return asset('storage/'.$this->image_path);
    }

    public function getMacronutrientsSummary(): array
    {
        return [
            'calories' => $this->calories,
            'protein' => $this->protein,
            'carbs' => $this->carbohydrates,
            'fat' => $this->fat,
        ];
    }

    public function getActualNutrition(): array
    {
        $percentage = $this->consumed_percentage / 100;
        return [
            'calories' => $this->calories * $percentage,
            'protein' => $this->protein * $percentage,
            'carbohydrates' => $this->carbohydrates * $percentage,
            'fat' => $this->fat * $percentage,
        ];
    }
}