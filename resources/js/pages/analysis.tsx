import { Head } from '@inertiajs/react';
import { RefreshCw, Brain, AlertCircle, Info, Heart, Activity, Flame, Beef, Wheat, Droplet, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface NutritionAnalysis {
    general_advice: string;
    important_info: string[];
    health_recommendations: string[];
    nutrition_status: string;
    raw_response: string;
}

interface OverallStats {
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    scan_count: number;
    average_daily_calories: number;
    average_daily_protein: number;
    average_daily_carbs: number;
    average_daily_fat: number;
}

interface MacroNutrientProps {
    label: string;
    value: number;
    unit: string;
    icon: any;
    color: string;
    bg: string;
}

function MacroNutrient({ label, value, unit, icon: Icon, color, bg }: MacroNutrientProps) {
    return (
        <div className={`flex items-center gap-3 rounded-xl p-3 min-w-[120px] ${bg}`}>
            <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold">
                    {Math.round(value)}<span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
                </p>
            </div>
        </div>
    );
}

export default function AnalysisPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
    const [overallStats, setOverallStats] = useState<OverallStats | null>(null);

    const analyzeNutrition = async () => {
        setLoading(true);
        setError(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/api/nutrition-analysis/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({}),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Gagal menganalisis nutrisi');
            }

            // Extract overall stats from response or calculate from food scans
            const statsResponse = await fetch('/api/food-scans/stats');
            const statsData = await statsResponse.json();
            setOverallStats(statsData);
            setAnalysis(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('baik') || lowerStatus.includes('good')) {
            return 'text-green-600 bg-green-50 border-green-200';
        }
        if (lowerStatus.includes('cukup') || lowerStatus.includes('moderate')) {
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getStatusIcon = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('baik') || lowerStatus.includes('good')) {
            return <Heart className="w-6 h-6" />;
        }
        if (lowerStatus.includes('cukup') || lowerStatus.includes('moderate')) {
            return <Activity className="w-6 h-6" />;
        }
        return <AlertCircle className="w-6 h-6" />;
    };

    return (
        <AppLayout>
            <Head title="Analisis Gizi AI" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto">
                <div className="mx-auto w-full max-w-md p-4 pb-24 md:max-w-lg lg:max-w-xl">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-bold">Analisis Gizi AI</h1>
                    <p className="text-sm text-muted-foreground">
                        Analisis komprehensif pola nutrisi Anda berdasarkan semua data
                    </p>
                </div>

                {/* Analyze Button Card */}
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Brain className="w-5 h-5 text-green-600" />
                            Analisis Nutrisi
                        </CardTitle>
                        <CardDescription>
                            AI akan menganalisis semua data nutrisi Anda dan memberikan saran komprehensif
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={analyzeNutrition}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Menganalisis...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4 mr-2" />
                                    Analisis dengan AI
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Error Message */}
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-900">Terjadi Kesalahan</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Overall Statistics */}
                {overallStats && (
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Statistik Nutrisi Lengkap
                            </CardTitle>
                            <CardDescription>
                                Berdasarkan {overallStats.scan_count} catatan makanan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Total Nutrition */}
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Total Nutrisi</p>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    <MacroNutrient
                                        label="Kalori"
                                        value={overallStats.total_calories}
                                        unit="kcal"
                                        icon={Flame}
                                        color="text-orange-500"
                                        bg="bg-orange-50"
                                    />
                                    <MacroNutrient
                                        label="Protein"
                                        value={overallStats.total_protein}
                                        unit="g"
                                        icon={Beef}
                                        color="text-red-500"
                                        bg="bg-red-50"
                                    />
                                    <MacroNutrient
                                        label="Karbo"
                                        value={overallStats.total_carbs}
                                        unit="g"
                                        icon={Wheat}
                                        color="text-amber-500"
                                        bg="bg-amber-50"
                                    />
                                    <MacroNutrient
                                        label="Lemak"
                                        value={overallStats.total_fat}
                                        unit="g"
                                        icon={Droplet}
                                        color="text-blue-500"
                                        bg="bg-blue-50"
                                    />
                                </div>
                            </div>

                            {/* Daily Average */}
                            <div className="border-t pt-4">
                                <p className="text-sm font-medium text-slate-700 mb-2">Rata-rata Harian</p>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    <MacroNutrient
                                        label="Kalori"
                                        value={overallStats.average_daily_calories}
                                        unit="kcal"
                                        icon={Flame}
                                        color="text-orange-500"
                                        bg="bg-orange-50"
                                    />
                                    <MacroNutrient
                                        label="Protein"
                                        value={overallStats.average_daily_protein}
                                        unit="g"
                                        icon={Beef}
                                        color="text-red-500"
                                        bg="bg-red-50"
                                    />
                                    <MacroNutrient
                                        label="Karbo"
                                        value={overallStats.average_daily_carbs}
                                        unit="g"
                                        icon={Wheat}
                                        color="text-amber-500"
                                        bg="bg-amber-50"
                                    />
                                    <MacroNutrient
                                        label="Lemak"
                                        value={overallStats.average_daily_fat}
                                        unit="g"
                                        icon={Droplet}
                                        color="text-blue-500"
                                        bg="bg-blue-50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* AI Analysis Results */}
                {analysis && (
                    <div className="space-y-6">
                        {/* Nutrition Status */}
                        <Card className={`border-2 ${getStatusColor(analysis.nutrition_status)}`}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full bg-white/50`}>
                                        {getStatusIcon(analysis.nutrition_status)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">
                                            Status Nutrisi
                                        </h3>
                                        <p className="text-sm">
                                            {analysis.nutrition_status}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* General Advice - Enhanced Visual */}
                        <Card className="border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                                <CardTitle className="flex items-center gap-2 text-white text-lg">
                                    <Brain className="w-5 h-5" />
                                    Saran Pola Makan
                                </CardTitle>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                {(() => {
                                    const adviceText = analysis.general_advice;
                                    
                                    // Try to parse structured content
                                    const numberedSections = adviceText.split(/\n(?=\d+\.)/);
                                    const bulletSections = adviceText.split(/\n(?=[-*•])/);
                                    
                                    // Choose format that seems most structured
                                    const sections = numberedSections.length > 1 ? numberedSections : 
                                                     bulletSections.length > 1 ? bulletSections : 
                                                     adviceText.split(/\n\n+/);
                                    
                                    const tipsEmojis = ['🥗', '💪', '🍎', '🥦', '🥩', '🥚', '🍞', '🥛', '🫐', '🍊'];
                                    
                                    return sections.map((section, idx) => {
                                        const cleanSection = section.trim();
                                        if (!cleanSection) return null;
                                        
                                        const lines = cleanSection.split('\n');
                                        const firstLine = lines[0].trim();
                                        const hasNumber = /^\d+[\.\)]/.test(firstLine);
                                        const hasBullet = /^[-*•]/.test(firstLine);
                                        
                                        // Check if it's a heading
                                        const isHeading = /^(Poin|Pola|Kunci|Tips|Strategi|Langkah|Saran|Rekomendasi|Penting|Catatan|Ingat|Prinsip)/i.test(firstLine);
                                        
                                        return (
                                            <div 
                                                key={idx} 
                                                className={`p-4 rounded-xl transition-all hover:shadow-md ${
                                                    isHeading 
                                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
                                                        : 'bg-white border border-slate-200 hover:border-green-300'
                                                }`}
                                            >
                                                {isHeading ? (
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-lg shadow-lg">
                                                            {tipsEmojis[idx % tipsEmojis.length]}
                                                        </span>
                                                        <h4 className="font-bold text-green-900 text-base">
                                                            {firstLine}
                                                        </h4>
                                                    </div>
                                                ) : hasNumber ? (
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                                            {firstLine.match(/\d+/)?.[0] || idx + 1}
                                                        </div>
                                                        <div className="flex-1 pt-1">
                                                            <p className="text-slate-700 leading-relaxed">
                                                                {lines.slice(1).join('\n').trim() || firstLine.replace(/^\d+[\.\)]\s*/, '')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : hasBullet ? (
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mt-0.5">
                                                            ✓
                                                        </span>
                                                        <p className="text-slate-700 leading-relaxed">
                                                            {firstLine.replace(/^[-*•]\s*/, '')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm mt-0.5">
                                                            💡
                                                        </span>
                                                        <p className="text-slate-700 leading-relaxed">
                                                            {cleanSection}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {lines.length > 1 && !hasNumber && !hasBullet && !isHeading && (
                                                    <p className="text-slate-700 leading-relaxed mt-2 pl-9">
                                                        {lines.slice(1).join('\n').trim()}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </CardContent>
                        </Card>

                        {/* Important Info - Only show if has content */}
                        {Array.isArray(analysis.important_info) && analysis.important_info.length > 0 && (
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        Informasi Penting
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {analysis.important_info.map((info, index) => (
                                            info && (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                                                    <span className="text-slate-700">{info}</span>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Health Recommendations - Only show if has content */}
                        {Array.isArray(analysis.health_recommendations) && analysis.health_recommendations.length > 0 && (
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Heart className="w-5 h-5 text-red-600" />
                                        Rekomendasi Kesehatan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {analysis.health_recommendations.map((rec, index) => (
                                            rec && (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-red-600" />
                                                    <span className="text-slate-700">{rec}</span>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!analysis && !loading && !error && (
                    <Card className="border-dashed border-slate-300 bg-slate-50">
                        <CardContent className="py-12 text-center">
                            <Brain className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Belum Ada Analisis
                            </h3>
                            <p className="text-slate-600 mb-4">
                                Klik tombol "Analisis dengan AI" untuk mendapatkan saran nutrisi komprehensif
                            </p>
                            <p className="text-sm text-slate-500">
                                AI akan menganalisis semua data nutrisi Anda dan memberikan rekomendasi yang dipersonalisasi
                            </p>
                        </CardContent>
                    </Card>
                )}
                </div>
            </div>
        </AppLayout>
    );
}