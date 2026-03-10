import { Head } from '@inertiajs/react';
import { Trash2, Loader2, Calendar, Edit2, Check, X } from 'lucide-react';
import React, { useState } from 'react';
import DailySummary from '@/components/daily-summary';
import ScanDetailModal from '@/components/scan-detail-modal';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';

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
    consumed_percentage: number;
    image_url: string;
    scanned_at: string;
}

interface HistoryPageProps {
    initialScans: Scan[];
}

export default function HistoryPage({ initialScans = [] }: HistoryPageProps) {
    const [scans, setScans] = useState<Scan[]>(initialScans);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingPercentage, setEditingPercentage] = useState(0);
    const [saving, setSaving] = useState<string | null>(null);
    const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);
    const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const deleteScan = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus scan ini?')) return;

        setDeleting(id);
        try {
            const response = await fetch(`/api/food-scan/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setScans((prev) => prev.filter((s) => s.id !== id));
                setSummaryRefreshKey((prev) => prev + 1);
                toast({
                    title: 'Berhasil Dihapus!',
                    description: 'Scan makanan telah dihapus dari riwayat.',
                });
            } else {
                toast({
                    title: 'Gagal Menghapus',
                    description: 'Terjadi kesalahan saat menghapus scan.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Failed to delete scan:', error);
            toast({
                title: 'Gagal Menghapus',
                description: 'Terjadi kesalahan jaringan.',
                variant: 'destructive'
            });
        } finally {
            setDeleting(null);
        }
    };

    const startEdit = (scan: Scan) => {
        setEditingId(scan.id);
        setEditingPercentage(scan.consumed_percentage);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingPercentage(0);
    };

    const saveEdit = async (id: string) => {
        setSaving(id);
        try {
            const response = await fetch(`/api/food-scan/${id}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    consumed_percentage: editingPercentage,
                }),
            });

            if (response.ok) {
                setScans((prev) =>
                    prev.map((s) =>
                        s.id === id ? { ...s, consumed_percentage: editingPercentage } : s
                    )
                );
                setEditingId(null);
                setEditingPercentage(0);
                setSummaryRefreshKey((prev) => prev + 1);
                
                toast({
                    title: 'Berhasil Disimpan!',
                    description: editingPercentage > 0 
                        ? `Makanan ditandai sebagai dimakan ${Math.round(editingPercentage)}%`
                        : 'Makanan disimpan sebagai cek gizi saja.',
                });
            } else {
                toast({
                    title: 'Gagal Menyimpan',
                    description: 'Terjadi kesalahan saat mengubah porsi.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Failed to update scan:', error);
            toast({
                title: 'Gagal Menyimpan',
                description: 'Terjadi kesalahan jaringan.',
                variant: 'destructive'
            });
        } finally {
            setSaving(null);
        }
    };

    const groupScansByDate = (scans: Scan[]) => {
        const grouped: { [key: string]: Scan[] } = {};
        
        scans.forEach((scan) => {
            const date = new Date(scan.scanned_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(scan);
        });

        return grouped;
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const getActualNutrition = (scan: Scan) => {
        const percentage = scan.consumed_percentage / 100;
        return {
            calories: Math.round(scan.calories * percentage),
            protein: Math.round(scan.protein * percentage * 10) / 10,
            carbs: Math.round(scan.carbohydrates * percentage * 10) / 10,
            fat: Math.round(scan.fat * percentage * 10) / 10,
        };
    };

    const handleCardClick = (scan: Scan) => {
        setSelectedScan(scan);
        setIsModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Riwayat" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto">
                <div className="mx-auto w-full max-w-md p-4 pb-24 md:max-w-lg lg:max-w-xl">
                <div>
                    <h1 className="text-2xl font-bold">Riwayat</h1>
                    <p className="text-sm text-muted-foreground">
                        Riwayat scan makanan Anda
                    </p>
                </div>

                <DailySummary refreshKey={summaryRefreshKey} />

                {scans.length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupScansByDate(scans)).map(([date, dateScans]) => (
                            <div key={date} className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {date}
                                </div>
                                <div className="space-y-3">
                                {dateScans.map((scan) => {
                                        const isEditing = editingId === scan.id;
                                        // Calculate actual nutrition based on editing percentage if in edit mode
                                        const actualNutrition = isEditing 
                                            ? getActualNutrition({ ...scan, consumed_percentage: editingPercentage })
                                            : getActualNutrition(scan);
                                        
                                        return (
                                            <div
                                                key={scan.id}
                                                className="relative rounded-xl border border-border bg-card p-4"
                                            >
                                                <div className="flex gap-4">
                                                    <img
                                                        src={scan.image_url}
                                                        alt={scan.food_name}
                                                        className="h-20 w-20 cursor-pointer rounded-lg object-cover transition hover:opacity-80"
                                                        onClick={() => handleCardClick(scan)}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold">{scan.food_name}</h3>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatTime(scan.scanned_at)}
                                                                </p>
                                                                {/* Consumed status */}
                                                                {scan.consumed_percentage > 0 && (
                                                                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                                        <span>Dimakan {Math.round(scan.consumed_percentage)}%</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => deleteScan(scan.id)}
                                                                disabled={deleting === scan.id}
                                                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                                            >
                                                                {deleting === scan.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Edit Mode */}
                                                        {isEditing ? (
                                                            <div className="mt-3 space-y-3 rounded-lg border border-primary/50 bg-primary/5 p-3">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">
                                                                        Berapa yang Anda makan?
                                                                    </label>
                                                                    <div className="flex items-center gap-3">
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={editingPercentage}
                                                                            onChange={(e) => setEditingPercentage(Number(e.target.value))}
                                                                            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                                                        />
                                                                        <span className="min-w-[3rem] text-right font-bold text-primary">
                                                                            {Math.round(editingPercentage)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {editingPercentage > 0 && (
                                                                    <div className="rounded-lg bg-primary/10 p-2 text-xs">
                                                                        <p className="font-medium text-primary">
                                                                            Akan dihitung ke daily summary:
                                                                        </p>
                                                                        <div className="mt-1 flex gap-2 text-xs">
                                                                            <span className="text-orange-600">
                                                                                {actualNutrition.calories} kcal
                                                                            </span>
                                                                            <span className="text-red-600">
                                                                                {actualNutrition.protein}g protein
                                                                            </span>
                                                                            <span className="text-amber-600">
                                                                                {actualNutrition.carbs}g karbo
                                                                            </span>
                                                                            <span className="text-blue-600">
                                                                                {actualNutrition.fat}g lemak
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => saveEdit(scan.id)}
                                                                        disabled={saving === scan.id}
                                                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                                                    >
                                                                        {saving === scan.id ? (
                                                                            <>
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                                Menyimpan...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Check className="h-4 w-4" />
                                                                                Simpan
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEdit}
                                                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                        Batal
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* Nutrition display */}
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
                                                                        {Math.round(scan.calories)} kcal
                                                                    </span>
                                                                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                                                                        {Math.round(scan.protein * 10) / 10}g protein
                                                                    </span>
                                                                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                                                                        {Math.round(scan.carbohydrates * 10) / 10}g karbo
                                                                    </span>
                                                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                                                                        {Math.round(scan.fat * 10) / 10}g lemak
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Edit button */}
                                                                <button
                                                                    onClick={() => startEdit(scan)}
                                                                    className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-semibold transition hover:bg-muted/80"
                                                                >
                                                                    <Edit2 className="h-3 w-3" />
                                                                    {scan.consumed_percentage === 0 ? 'Tandai Dimakan' : 'Edit Porsi'}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 font-semibold">Belum ada riwayat</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Mulai scan makanan untuk membangun riwayat Anda
                            </p>
                        </div>
                    </div>
                )}

                {/* Scan Detail Modal */}
                <ScanDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={selectedScan}
                />
                </div>
            </div>
        </AppLayout>
    );
}