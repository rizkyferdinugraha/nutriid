<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NutritionProfile extends \Illuminate\Database\Eloquent\Model
{
    use HasFactory;

    protected $fillable = [
        'age',
        'weight',
        'height',
        'gender',
        'user_id',
    ];

    protected $casts = [
        'age' => 'integer',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create nutrition profile for user
     */
    public static function getOrCreateForUser(int $userId): ?self
    {
        $profile = self::where('user_id', $userId)->first();
        
        if (! $profile) {
            // Return null if no profile exists - will be created when user saves data
            return null;
        }
        
        return $profile;
    }

    /**
     * Create or update nutrition profile for user
     */
    public static function updateOrCreateForUser(int $userId, array $data): self
    {
        $profile = self::where('user_id', $userId)->first();
        
        if (! $profile) {
            return self::create(array_merge(['user_id' => $userId], $data));
        }
        
        $profile->update($data);
        return $profile;
    }
}