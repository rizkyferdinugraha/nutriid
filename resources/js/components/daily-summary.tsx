import { Flame, Beef, Wheat, Droplet, Utensils } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NutritionInfoModal from './nutrition-info-modal';

interface NutritionTargets {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface DailySummaryData {
    date: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    scan_count: number;
    targets?: NutritionTargets | null;
}

interface DailySummaryProps {
    date?: string;
    refreshKey?: number;
}

function calculateProgress(consumed: number, target: number): number {
    if (!target || target === 0) return 0;
    return Math.round((consumed / target) * 100);
}

function getProgressColor(progress: number): string {
    if (progress >= 80 && progress <= 120) return 'bg-green-500';
    if (progress > 120) return 'bg-red-500';
    return 'bg-amber-500';
}

interface NutritionInfo {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    value: number;
}

export default function DailySummary({ date, refreshKey }: DailySummaryProps) {
    const [selectedNutrition, setSelectedNutrition] = useState<NutritionInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summary, setSummary] = useState<DailySummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDailySummary();
    }, [date, refreshKey]);

    const fetchDailySummary = async () => {
        try {
            const url = date ? `/api/daily-summary?date=${date}` : '/api/daily-summary';
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            setSummary(data.data);
        } catch (error) {
            console.error('Failed to fetch daily summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!summary) return null;

    const stats = [
        { 
            label: 'Kalori', 
            value: Math.round(summary.total_calories), 
            unit: 'kkal',
            icon: Flame,
            color: 'text-orange-500',
            bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20'
        },
        { 
            label: 'Protein', 
            value: Math.round(summary.total_protein * 10) / 10, 
            unit: 'g',
            icon: Beef,
            color: 'text-red-500',
            bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20'
        },
        { 
            label: 'Karbo', 
            value: Math.round(summary.total_carbs * 10) / 10, 
            unit: 'g',
            icon: Wheat,
            color: 'text-amber-500',
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20'
        },
        { 
            label: 'Lemak', 
            value: Math.round(summary.total_fat * 10) / 10, 
            unit: 'g',
            icon: Droplet,
            color: 'text-blue-500',
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20'
        },
    ];

    const handleCardClick = (stat: NutritionInfo) => {
        const nutritionWithTargets = {
            ...stat,
            target: getTargetValue(stat.label),
            consumed: stat.value,
        };
        setSelectedNutrition(nutritionWithTargets);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedNutrition(null);
    };

    // Get target value for each nutrient
    const getTargetValue = (label: string): number => {
        if (!summary.targets) return 0;
        switch (label) {
            case 'Kalori': return summary.targets.calories;
            case 'Protein': return summary.targets.protein;
            case 'Karbo': return summary.targets.carbs;
            case 'Lemak': return summary.targets.fat;
            default: return 0;
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Ringkasan Hari Ini</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Utensils className="h-3.5 w-3.5" />
                    {summary.scan_count} {summary.scan_count === 1 ? 'scan' : 'scan'}
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {stats.map((stat) => {
                    const target = getTargetValue(stat.label);
                    const progress = calculateProgress(stat.value, target);
                    const showProgress = target > 0;

                    return (
                        <div 
                            key={stat.label}
                            className={`rounded-lg p-2.5 text-center ${stat.bg} cursor-pointer hover:scale-105 transition-transform duration-200`}
                            onClick={() => handleCardClick(stat)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleCardClick(stat);
                                }
                            }}
                        >
                            <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                            <p className="text-lg font-bold">{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground">{stat.unit}</p>
                            {showProgress && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full ${getProgressColor(progress)} transition-all duration-300`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground mt-1">
                                        {Math.floor(progress)}% dari {target} {stat.unit}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <NutritionInfoModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                nutrition={selectedNutrition}
                targets={summary.targets}
            />
        </div>
    );
}