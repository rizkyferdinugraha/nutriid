import { Beef, Flame, Wheat, Droplet, Sparkles, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

interface NutritionData {
    id: string;
    food_name: string;
    description: string | null;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number | null;
    sugar: number | null;
    sodium: number | null;
    serving_size: string | null;
    confidence_score: number | null;
    image_url: string;
    scanned_at: string;
    scan_status?: 'success' | 'failed';
}

interface NutritionCardProps {
    data: NutritionData;
    compact?: boolean;
    onClick?: () => void;
}

export default function NutritionCard({ data, compact = false, onClick }: NutritionCardProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    
    const macros = [
        { 
            label: 'Kalori', 
            value: Math.round(data.calories), 
            unit: 'kkal',
            icon: Flame,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-950/30'
        },
        { 
            label: 'Protein', 
            value: Math.round(data.protein * 10) / 10, 
            unit: 'g',
            icon: Beef,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-950/30'
        },
        { 
            label: 'Karbo', 
            value: Math.round(data.carbohydrates * 10) / 10, 
            unit: 'g',
            icon: Wheat,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-950/30'
        },
        { 
            label: 'Lemak', 
            value: Math.round(data.fat * 10) / 10, 
            unit: 'g',
            icon: Droplet,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-950/30'
        },
    ];

    if (compact) {
        return (
            <div 
                className={`flex items-center gap-3 rounded-xl border border-border bg-card p-3 ${onClick ? 'cursor-pointer transition hover:border-primary/50 hover:bg-accent' : ''}`}
                onClick={onClick}
            >
                <img 
                    src={data.image_url} 
                    alt={data.food_name}
                    className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{data.food_name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span>{Math.round(data.calories)} kcal</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Failed Scan Warning */}
            {data.scan_status === 'failed' && (
                <div className="flex items-start gap-2 rounded-lg border-2 border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                            Identifikasi Rendah
                        </p>
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                            Makanan kurang jelas terlihat. Data gizi mungkin tidak akurat. Silakan scan ulang atau periksa data secara manual.
                        </p>
                    </div>
                </div>
            )}

            {/* Food Info Header */}
            <div className="flex items-start gap-4">
                <img 
                    src={data.image_url} 
                    alt={data.food_name}
                    className="h-20 w-20 rounded-xl object-cover shadow-sm"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{data.food_name}</h3>
                        {data.confidence_score !== null && (
                            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                <Sparkles className="h-3 w-3" />
                                {Math.round(data.confidence_score)}%
                            </div>
                        )}
                    </div>
                    {data.serving_size && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            Porsi: {data.serving_size}
                        </p>
                    )}
                    {data.description && (
                        <div className="mt-2">
                            <p className={`text-sm text-muted-foreground ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                                {data.description}
                            </p>
                            <button
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                                {isDescriptionExpanded ? (
                                    <>
                                        <ChevronUp className="h-3 w-3" />
                                        Lihat sedikit
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3 w-3" />
                                        Lihat selengkapnya
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Macronutrients - Scrollable */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {macros.map((macro) => (
                    <div 
                        key={macro.label}
                        className={`flex items-center gap-3 rounded-xl p-3 min-w-[140px] ${macro.bg}`}
                    >
                        <macro.icon className={`h-5 w-5 ${macro.color} flex-shrink-0`} />
                        <div>
                            <p className="text-xs text-muted-foreground">{macro.label}</p>
                            <p className="font-semibold">
                                {macro.value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{macro.unit}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Nutrition Info */}
            {(data.fiber !== null || data.sugar !== null || data.sodium !== null) && (
                <div className="flex flex-wrap gap-2">
                    {data.fiber !== null && (
                        <div className="rounded-full bg-muted px-3 py-1 text-xs">
                            Serat: {Math.round(data.fiber * 10) / 10}g
                        </div>
                    )}
                    {data.sugar !== null && (
                        <div className="rounded-full bg-muted px-3 py-1 text-xs">
                            Gula: {Math.round(data.sugar * 10) / 10}g
                        </div>
                    )}
                    {data.sodium !== null && (
                        <div className="rounded-full bg-muted px-3 py-1 text-xs">
                            Natrium: {Math.round(data.sodium)}mg
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}