import { Head, Link } from '@inertiajs/react';
import { Camera, History, Utensils, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import DailySummary from '@/components/daily-summary';
import NutritionCard from '@/components/nutrition-card';
import ScanDetailModal from '@/components/scan-detail-modal';
import { toast } from '@/hooks/use-toast';

interface Scan {
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
}

export default function Dashboard() {
    const [recentScans, setRecentScans] = useState<Scan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRecentScans();

        // Check for toast message from localStorage
        const storedToast = localStorage.getItem('showSuccessToast');
        if (storedToast) {
            try {
                const toastData = JSON.parse(storedToast);
                toast(toastData);
                localStorage.removeItem('showSuccessToast');
            } catch (error) {
                console.error('Error parsing toast data:', error);
                localStorage.removeItem('showSuccessToast');
            }
        }
    }, []);

    const fetchRecentScans = async () => {
        try {
            const response = await fetch('/api/food-scan?limit=3', {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            setRecentScans(data.data || []);
        } catch (error) {
            console.error('Failed to fetch recent scans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (scan: Scan) => {
        setSelectedScan(scan);
        setIsModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-auto p-4 pb-24">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">NutriiD</h1>
                        <p className="text-sm text-muted-foreground">
                            Lacak nutrisi Anda dengan AI
                        </p>
                    </div>
                    <Link
                        href="/scan"
                        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                        <Camera className="h-4 w-4" />
                        Scan
                    </Link>
                </div>

                {/* Daily Summary */}
                <DailySummary />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/scan"
                        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition hover:bg-muted"
                    >
                        <div className="rounded-full bg-primary/10 p-3">
                            <Camera className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Pindai Makanan</span>
                    </Link>
                    <Link
                        href="/history"
                        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition hover:bg-muted"
                    >
                        <div className="rounded-full bg-secondary/10 p-3">
                            <History className="h-6 w-6 text-secondary" />
                        </div>
                        <span className="text-sm font-medium">Riwayat</span>
                    </Link>
                </div>

                {/* Recent Scans */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Scan Terbaru</h2>
                        <Link
                            href="/history"
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 animate-pulse rounded-xl bg-muted"
                                />
                            ))}
                        </div>
                    ) : recentScans.length > 0 ? (
                        <div className="space-y-3">
                            {recentScans.map((scan) => (
                                <NutritionCard 
                                    key={scan.id} 
                                    data={scan} 
                                    compact 
                                    onClick={() => handleCardClick(scan)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-8">
                            <Utensils className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                            <p className="font-medium">Belum ada scan</p>
                            <p className="text-sm text-muted-foreground">
                                Mulai scan makanan pertama Anda!
                            </p>
                            </div>
                            <Link
                                href="/scan"
                                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                            >
                                Scan Sekarang
                            </Link>
                        </div>
                    )}
                </div>

                {/* Tips Section */}
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div>
                            <h3 className="font-medium">Tips</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Usahakan sertakan protein di setiap makanan untuk membantu menjaga massa otot dan membuat Anda kenyang lebih lama.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scan Detail Modal */}
            <ScanDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedScan}
            />
        </AppLayout>
    );
}
