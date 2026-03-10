import { Head, Link } from '@inertiajs/react';
import { 
    Camera, 
    Utensils, 
    TrendingUp, 
    Zap,
    Sparkles,
    ArrowRight,
    Leaf,
    Apple,
    BarChart3,
    Smartphone,
    History as HistoryIcon
} from 'lucide-react';

function AppLogoIcon({ className }: { className?: string }) {
    return <img src="/favicon-32x32.png" alt="NutriiD" className={className} />;
}

export default function Landing() {
    return (
        <>
            <Head title="NutriiD - Lacak Nutrisi dengan AI" />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
                {/* Navigation */}
                <nav className="border-b border-border bg-white/80 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                    <AppLogoIcon className="h-5 w-5" />
                                </div>
                                <span className="text-xl font-bold text-foreground">NutriiD</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                                >
                                    Daftar
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-grid-slate-200/50" />
                    <div className="relative mx-auto max-w-7xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                <Sparkles className="h-4 w-4" />
                                <span>Didukung oleh AI Canggih</span>
                            </div>
                            <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                                Lacak Nutrisi Makanan
                                <span className="block text-primary">Dengan Kamera</span>
                            </h1>
                            <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                                NutriiD membantu Anda memahami nilai gizi setiap makanan hanya dengan foto.
                                Pantau asupan harian dan capai tujuan kesehatan Anda dengan mudah.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition hover:bg-primary/90"
                                >
                                    Mulai Gratis
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="#features"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-input bg-background px-8 py-3 text-base font-medium transition hover:bg-muted"
                                >
                                    Pelajari Lebih Lanjut
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Fitur Unggulan
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Temukan cara NutriiD membantu Anda menjalani hidup lebih sehat
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <Camera className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">
                                    Scan Makanan
                                </h3>
                                <p className="text-muted-foreground">
                                    Ambil foto makanan Anda dan biarkan AI menganalisis nilai gizinya secara otomatis
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                                    <BarChart3 className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">
                                    Tracking Harian
                                </h3>
                                <p className="text-muted-foreground">
                                    Pantau kalori, protein, karbohidrat, dan lemak yang Anda konsumsi setiap hari
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                                    <TrendingUp className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">
                                    Analisis Lengkap
                                </h3>
                                <p className="text-muted-foreground">
                                    Dapatkan analisis mendalam tentang asupan nutrisi dan saran makan yang sehat
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                                    <HistoryIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">
                                    Riwayat Scan
                                </h3>
                                <p className="text-muted-foreground">
                                    Lihat kembali semua scan makanan Anda dan pantau pola makan dari waktu ke waktu
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                                    <Zap className="h-6 w-6 text-orange-500" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">
                                    Cepat & Akurat
                                </h3>
                                <p className="text-muted-foreground">
                                    Analisis AI yang cepat dengan akurasi tinggi untuk berbagai jenis makanan
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                                    <Smartphone className="h-6 w-6 text-cyan-500" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">
                                    PWA Ready
                                </h3>
                                <p className="text-muted-foreground">
                                    Gunakan seperti aplikasi native di smartphone Anda dengan Progressive Web App
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white/50">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Cara Kerja
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Mulai lacak nutrisi dalam 3 langkah mudah
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                                    1
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">
                                    Scan Makanan
                                </h3>
                                <p className="text-muted-foreground">
                                    Ambil foto makanan yang ingin Anda analisis menggunakan kamera perangkat
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                                    2
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">
                                    Analisis AI
                                </h3>
                                <p className="text-muted-foreground">
                                    AI kami akan mengidentifikasi jenis makanan dan menghitung nilai gizinya
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                                    3
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">
                                    Lacak Progress
                                </h3>
                                <p className="text-muted-foreground">
                                    Pantau asupan nutrisi harian dan capai tujuan kesehatan Anda
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Nutrition Info */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Apa yang Kami Lacak
                            </h2>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-border bg-card p-6 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                                    <Apple className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">Kalori</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Pantau total kalori harian
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-6 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                                    <Utensils className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">Protein</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Kebutukan protein harian
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-6 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                                    <Sparkles className="h-8 w-8 text-yellow-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">Karbohidrat</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Sumber energi utama
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-6 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                    <Leaf className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">Lemak</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Lemak sehat harian
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center text-primary-foreground">
                            <div className="absolute inset-0 bg-grid-white/20" />
                            <div className="relative">
                                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                                    Mulai Hidup Sehat Hari Ini
                                </h2>
                                <p className="mb-8 text-lg text-primary-foreground/90">
                                    Bergabunglah dengan ribuan orang yang telah mengubah pola makan mereka dengan NutriiD
                                </p>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-base font-medium text-primary transition hover:bg-white/90"
                                >
                                    Daftar Sekarang - Gratis
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border bg-white/80 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                    <AppLogoIcon className="h-3 w-3" />
                                </div>
                                <span className="font-semibold text-foreground">NutriiD</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                © 2026 NutriiD. Dibuat dengan ❤️ untuk kesehatan Indonesia.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}