import { Beef, Flame, Wheat, Droplet, Sparkles, X, Calendar, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ScanData {
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

interface ScanDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ScanData | null;
}

export default function ScanDetailModal({ isOpen, onClose, data }: ScanDetailModalProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    
    if (!data) return null;

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
            label: 'Karbohidrat', 
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="sr-only">Detail Scan Makanan</DialogTitle>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Tutup</span>
                    </button>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Food Image */}
                    <img 
                        src={data.image_url} 
                        alt={data.food_name}
                        className="w-full h-48 object-cover rounded-xl shadow-sm"
                    />

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

                    {/* Food Name & Confidence */}
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <h2 className="text-xl font-bold">{data.food_name}</h2>
                            {data.confidence_score !== null && (
                                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary whitespace-nowrap">
                                    <Sparkles className="h-3 w-3" />
                                    {Math.round(data.confidence_score)}%
                                </div>
                            )}
                        </div>
                        
                        {data.serving_size && (
                            <p className="text-sm font-medium text-primary">
                                Porsi: {data.serving_size}
                            </p>
                        )}

                        {data.description && (
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className={`text-sm leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                                    {data.description}
                                </p>
                                <button
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
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

                    {/* Scan Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(data.scanned_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(data.scanned_at)}</span>
                        </div>
                    </div>

                    {/* Macronutrients */}
                    <div className="space-y-3">
                        <h3 className="font-semibold">Nilai Gizi</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {macros.map((macro) => (
                                <div 
                                    key={macro.label}
                                    className={`flex items-center gap-3 rounded-xl p-3 ${macro.bg}`}
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
                    </div>

                    {/* Additional Nutrition Info */}
                    {(data.fiber !== null || data.sugar !== null || data.sodium !== null) && (
                        <div className="space-y-3">
                            <h3 className="font-semibold">Info Tambahan</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.fiber !== null && (
                                    <div className="rounded-full bg-muted px-3 py-1.5 text-sm">
                                        <span className="font-medium">Serat:</span> {Math.round(data.fiber * 10) / 10}g
                                    </div>
                                )}
                                {data.sugar !== null && (
                                    <div className="rounded-full bg-muted px-3 py-1.5 text-sm">
                                        <span className="font-medium">Gula:</span> {Math.round(data.sugar * 10) / 10}g
                                    </div>
                                )}
                                {data.sodium !== null && (
                                    <div className="rounded-full bg-muted px-3 py-1.5 text-sm">
                                        <span className="font-medium">Natrium:</span> {Math.round(data.sodium)}mg
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}