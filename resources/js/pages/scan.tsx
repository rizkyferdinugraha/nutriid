import { Head, router } from '@inertiajs/react';
import { Camera, SwitchCamera, ImagePlus, Loader2, Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import NutritionCard from '@/components/nutrition-card';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';

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

export default function ScanPage() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCorrecting, setIsCorrecting] = useState(false);
    const [showCorrectionForm, setShowCorrectionForm] = useState(false);
    const [correctedFoodName, setCorrectedFoodName] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [nutritionResult, setNutritionResult] = useState<NutritionData | null>(null);
    const [consumedPercentage, setConsumedPercentage] = useState(0);
    const [scanId, setScanId] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [cameraActive, setCameraActive] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsStreaming(false);
    };

    const toggleCamera = () => {
        stopCamera();
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    useEffect(() => {
        if (!cameraActive) return;

        let mounted = true;

        const initCamera = async () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                const video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                    streamRef.current = stream;

                    video.onloadedmetadata = () => {
                        video.play().then(() => {
                            if (mounted) {
                                setIsStreaming(true);
                            }
                        }).catch(err => {
                            console.error('Error playing video:', err);
                        });
                    };
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                if (mounted) {
                    toast({
                        title: 'Kesalahan Kamera',
                        description: 'Tidak dapat mengakses kamera. Periksa izin aplikasi.',
                        variant: 'destructive'
                    });
                }
            }
        };

        initCamera();

        return () => {
            mounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setIsStreaming(false);
        };
    }, [facingMode, cameraActive]);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
                setSelectedFile(file);
                setCapturedImage(URL.createObjectURL(blob));
                stopCamera();
            }
        }, 'image/jpeg', 0.9);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setCapturedImage(URL.createObjectURL(file));
            stopCamera();
        }
    };

    const analyzeImage = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setNutritionResult(null);
        setConsumedPercentage(0);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('/api/food-scan', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze image');
            }

            setNutritionResult(data.data);
            setScanId(data.data.id);
            
            // Show different toast based on scan status
            if (data.data.scan_status === 'failed') {
                toast({
                    title: '⚠️ Identifikasi Rendah',
                    description: `Makanan kurang jelas. Data gizi mungkin tidak akurat: ${data.data.food_name}`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Analisis Selesai!',
                    description: `Teridentifikasi: ${data.data.food_name}`,
                });
            }
        } catch (error) {
            console.error('Analysis error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal menganalisis gambar makanan';
            
            // Show detailed error information
            toast({
                title: 'Analisis Gagal',
                description: errorMessage,
                variant: 'destructive',
                duration: 5000,
            });
            
            // Log more details for debugging
            console.log('Error details:', {
                message: errorMessage,
                timestamp: new Date().toISOString(),
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveScan = async () => {
        if (!nutritionResult) return;

        setIsSaving(true);

        // If we already have a scan ID, update it instead of creating a new one
        const url = scanId ? `/api/food-scan/${scanId}` : '/api/food-scan';
        const method = scanId ? 'PUT' : 'POST';
        
        const formData = new FormData();
        if (!scanId) {
            formData.append('image', selectedFile!);
        }
        formData.append('consumed_percentage', consumedPercentage.toString());

        try {
            const response = await fetch(url, {
                method: method,
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save scan');
            }

            setNutritionResult(data.data);

            // Store toast message in localStorage to show on dashboard
            localStorage.setItem('showSuccessToast', JSON.stringify({
                title: 'Berhasil Disimpan!',
                description: consumedPercentage > 0 
                    ? 'Makanan telah ditandai sebagai dimakan.' 
                    : 'Makanan telah disimpan ke riwayat.',
                duration: 3000
            }));

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.visit('/dashboard');
            }, 1500);
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: 'Gagal Menyimpan',
                description: error instanceof Error ? error.message : 'Gagal menyimpan scan makanan',
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const resetCapture = () => {
        setCapturedImage(null);
        setSelectedFile(null);
        setNutritionResult(null);
        setScanId(null);
        setConsumedPercentage(0);
        setShowCorrectionForm(false);
        setCorrectedFoodName('');
        setCameraActive(false);
        setTimeout(() => setCameraActive(true), 100);
    };

    const handleCorrectFoodName = async () => {
        if (!correctedFoodName.trim() || !scanId) return;

        setIsCorrecting(true);

        try {
            const response = await fetch(`/api/food-scan/${scanId}/correct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    corrected_food_name: correctedFoodName.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengoreksi nama makanan');
            }

            setNutritionResult(data.data);
            setShowCorrectionForm(false);
            setCorrectedFoodName('');
            
            toast({
                title: 'Koreksi Berhasil!',
                description: `Nama makanan diperbarui: ${data.data.food_name}`,
            });
        } catch (error) {
            console.error('Correction error:', error);
            toast({
                title: 'Koreksi Gagal',
                description: error instanceof Error ? error.message : 'Gagal mengoreksi nama makanan',
                variant: 'destructive'
            });
        } finally {
            setIsCorrecting(false);
        }
    };

    const getActualNutrition = () => {
        if (!nutritionResult) return null;
        const percentage = consumedPercentage / 100;
        return {
            calories: Math.round(nutritionResult.calories * percentage),
            protein: Math.round(nutritionResult.protein * percentage * 10) / 10,
            carbs: Math.round(nutritionResult.carbohydrates * percentage * 10) / 10,
            fat: Math.round(nutritionResult.fat * percentage * 10) / 10,
        };
    };

    const actualNutrition = getActualNutrition();

    return (
        <AppLayout>
            <Head title="Scan Makanan" />
            <div className="flex h-full flex-1 flex-col">
            {/* Camera / Preview Area */}
            <div className="relative flex-1 bg-black">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                            style={{ opacity: isStreaming ? 1 : 0 }}
                        />
                        {!isStreaming && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}
                        {isStreaming && (
                            <button
                                onClick={toggleCamera}
                                className="absolute right-4 top-4 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition hover:bg-black/70"
                            >
                                <SwitchCamera className="h-6 w-6" />
                            </button>
                        )}
                    </>
                ) : (
                    <img
                        src={capturedImage}
                        alt="Captured food"
                        className="h-full w-full object-cover"
                    />
                )}

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Controls */}
                <div className="bg-background p-4 pb-24">
                    {nutritionResult ? (
                        <div className="space-y-4">
                            <NutritionCard data={nutritionResult} />
                            
                            {/* Food Name Correction Form */}
                            {!showCorrectionForm ? (
                                <button
                                    onClick={() => setShowCorrectionForm(true)}
                                    className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                >
                                    <p className="font-medium">Apakah nama makanan salah?</p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300">Ketik di sini untuk memasukkan nama makanan yang benar</p>
                                </button>
                            ) : (
                                <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                            Masukkan nama makanan yang benar:
                                        </label>
                                        <button
                                            onClick={() => {
                                                setShowCorrectionForm(false);
                                                setCorrectedFoodName('');
                                            }}
                                            className="rounded-full p-1 text-amber-600 transition hover:bg-amber-200 dark:text-amber-400 dark:hover:bg-amber-900"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={correctedFoodName}
                                        onChange={(e) => setCorrectedFoodName(e.target.value)}
                                        placeholder="Contoh: Nasi Goreng Spesial"
                                        className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-amber-700 dark:bg-amber-950 dark:text-white"
                                        disabled={isCorrecting}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleCorrectFoodName();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleCorrectFoodName}
                                        disabled={isCorrecting || !correctedFoodName.trim()}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCorrecting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Menganalisa ulang...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Perbaiki Nama Makanan
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                            
                            {/* Slider for consumed percentage */}
                            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">
                                        Berapa yang Anda makan?
                                    </label>
                                    <span className="text-sm font-bold text-primary">
                                        {consumedPercentage}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={consumedPercentage}
                                    onChange={(e) => setConsumedPercentage(Number(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Hanya cek gizi</span>
                                    <span>Dimakan sepenuhnya</span>
                                </div>
                                {actualNutrition && consumedPercentage > 0 && (
                                    <div className="mt-3 rounded-lg bg-primary/10 p-3 text-sm">
                                        <p className="font-medium text-primary">
                                            Akan dihitung ke daily summary:
                                        </p>
                                        <div className="mt-2 flex gap-3 text-xs">
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
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={saveScan}
                                    disabled={isSaving}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan'
                                    )}
                                </button>
                                <button
                                    onClick={resetCapture}
                                    className="flex-1 rounded-xl border border-border py-3 font-semibold transition hover:bg-muted"
                                >
                                    Scan Makanan Lain
                                </button>
                            </div>
                        </div>
                    ) : capturedImage ? (
                        <div className="space-y-3">
                            <p className="text-center text-sm text-muted-foreground">
                                Siap menganalisis makanan Anda
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={resetCapture}
                                    className="flex-1 rounded-xl border border-border py-3 font-semibold transition hover:bg-muted"
                                >
                                    Ulang
                                </button>
                                <button
                                    onClick={analyzeImage}
                                    disabled={isAnalyzing}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Menganalisis...
                                        </>
                                    ) : (
                                        'Analisis Makanan'
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-xl border border-border p-4 transition hover:bg-muted"
                            >
                                <ImagePlus className="h-6 w-6" />
                            </button>
                            <button
                                onClick={capturePhoto}
                                disabled={!isStreaming}
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 disabled:opacity-50"
                            >
                                <Camera className="h-8 w-8" />
                            </button>
                            <div className="w-14" />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}