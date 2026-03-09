import { Flame, Beef, Wheat, Droplet } from 'lucide-react';
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface NutritionTargets {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface NutritionInfo {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    target?: number;
    consumed?: number;
}

interface NutritionInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    nutrition: NutritionInfo | null;
    targets?: NutritionTargets | null;
}

const nutritionDetails: Record<string, {
    what: string;
    value: string;
    why: string;
}> = {
    Kalori: {
        what: 'Kalori adalah satuan energi yang digunakan tubuh untuk berfungsi. Satu kalori adalah jumlah energi yang diperlukan untuk meningkatkan suhu 1 gram air sebesar 1 derajat Celsius.',
        value: 'Jumlah energi total yang diperoleh dari semua makanan yang dikonsumsi hari ini. Nilai ini merepresentasikan total energi yang masuk ke dalam tubuh Anda.',
        why: 'Manusia membutuhkan kalori untuk:\n• Menggerakkan tubuh dan beraktivitas\n• Menjaga fungsi organ penting (jantung, paru-paru, otak)\n• Mempertahankan suhu tubuh\n• Mendukung pertumbuhan dan perbaikan sel\n\nKebutuhan kalori harian bervariasi berdasarkan usia, jenis kelamin, berat badan, dan tingkat aktivitas fisik.',
    },
    Protein: {
        what: 'Protein adalah makronutrien esensial yang terdiri dari asam amino. Protein dikenal sebagai "bahan bangunan" tubuh karena sangat penting untuk pembentukan dan perbaikan jaringan.',
        value: 'Total jumlah protein yang dikonsumsi dalam gram. Protein memberikan 4 kalori per gram yang dikonsumsi.',
        why: 'Manusia membutuhkan protein untuk:\n• Membangun dan memperbaiki otot dan jaringan\n• Membuat enzim dan hormon\n• Menguatkan sistem kekebalan tubuh\n• Mengangkut oksigen ke seluruh tubuh (hemoglobin)\n• Menjaga kesehatan rambut dan kulit\n\nKebutuhan protein harian: sekitar 0.8-1.2 gram per kg berat badan untuk orang dewasa.',
    },
    Karbo: {
        what: 'Karbohidrat adalah makronutrien yang menjadi sumber energi utama bagi tubuh. Karbohidrat terbagi menjadi dua jenis: sederhana (gula) dan kompleks (serat, pati).',
        value: 'Total jumlah karbohidrat yang dikonsumsi dalam gram. Karbohidrat memberikan 4 kalori per gram yang dikonsumsi.',
        why: 'Manusia membutuhkan karbohidrat untuk:\n• Menyediakan energi utama untuk otak dan tubuh\n• Menjaga fungsi otak yang optimal\n• Menyimpan energi dalam bentuk glikogen\n• Membantu pencernaan (melalui serat)\n• Mencegah pemecahan protein untuk energi\n\nKebutuhan karbohidrat: sekitar 45-65% dari total kalori harian.',
    },
    Lemak: {
        what: 'Lemak adalah makronutrien yang kaya energi dan penting untuk berbagai fungsi tubuh. Lemak terbagi menjadi lemak jenuh, lemak tak jenuh tunggal, dan lemak tak jenuh ganda.',
        value: 'Total jumlah lemak yang dikonsumsi dalam gram. Lemak memberikan 9 kalori per gram yang dikonsumsi.',
        why: 'Manusia membutuhkan lemak untuk:\n• Menyimpan energi dalam jangka panjang\n• Menyerap vitamin A, D, E, dan K (vitamin larut lemak)\n• Membangun membran sel\n• Melindungi organ vital\n• Menghasilkan hormon penting\n• Menjaga suhu tubuh\n\nKebutuhan lemak: sekitar 20-35% dari total kalori harian, dengan prioritas pada lemak tak jenuh.',
    },
};

const iconMap: Record<string, React.ElementType> = {
    Kalori: Flame,
    Protein: Beef,
    Karbo: Wheat,
    Lemak: Droplet,
};

export default function NutritionInfoModal({
    isOpen,
    onClose,
    nutrition,
    targets,
}: NutritionInfoModalProps) {
    if (!nutrition) return null;

    const details = nutritionDetails[nutrition.label];
    const IconComponent = iconMap[nutrition.label];

    // Get target and consumed values for personalized display
    const getTargetValue = (): number | null => {
        if (!targets) return null;
        switch (nutrition.label) {
            case 'Kalori': return targets.calories;
            case 'Protein': return targets.protein;
            case 'Karbo': return targets.carbs;
            case 'Lemak': return targets.fat;
            default: return null;
        }
    };

    const target = getTargetValue();
    const consumed = nutrition.consumed || 0;
    const hasPersonalizedData = target !== null && target > 0;

    // Helper functions for fulfillment and warning messages
    const getNutrientType = (): string => {
        switch (nutrition.label) {
            case 'Kalori': return 'calories';
            case 'Protein': return 'protein';
            case 'Karbo': return 'carbs';
            case 'Lemak': return 'fat';
            default: return '';
        }
    };

    const getFulfillmentTitle = (): string => {
        const messages: Record<string, string> = {
            calories: 'Target Kalori Terpenuhi!',
            protein: 'Target Protein Terpenuhi!',
            carbs: 'Target Karbohidrat Terpenuhi!',
            fat: 'Target Lemak Terpenuhi!',
        };
        return messages[getNutrientType()] || '';
    };

    const getFulfillmentMessage = (): string => {
        const messages: Record<string, string> = {
            calories: 'Selamat! Anda telah mencapai target kalori harian Anda. Tubuh Anda memiliki energi yang cukup untuk mendukung aktivitas sehari-hari.',
            protein: 'Hebat! Asupan protein hari ini sudah cukup untuk memenuhi kebutuhan tubuh Anda dalam membangun dan memperbaiki jaringan.',
            carbs: 'Bagus! Asupan karbohidrat Anda sudah mencukupi untuk memberikan energi utama bagi otak dan tubuh.',
            fat: 'Sempurna! Asupan lemak Anda sudah mencukupi untuk berbagai fungsi penting dalam tubuh.',
        };
        return messages[getNutrientType()] || '';
    };

    const getFulfillmentBenefits = (): string[] => {
        const benefits: Record<string, string[]> = {
            calories: [
                'Energi optimal untuk beraktivitas',
                'Mendukung fungsi organ vital',
                'Mencegah kelelahan dan lemas',
                'Mendukung pemulihan tubuh',
            ],
            protein: [
                'Mendukung pertumbuhan dan perbaikan otot',
                'Menguatkan sistem kekebalan tubuh',
                'Menjaga kesehatan rambut dan kulit',
                'Membantu produksi enzim dan hormon',
            ],
            carbs: [
                'Energi utama untuk otak dan tubuh',
                'Menjaga fungsi kognitif optimal',
                'Mencegah pemecahan protein untuk energi',
                'Menyimpan energi dalam bentuk glikogen',
            ],
            fat: [
                'Menyerap vitamin A, D, E, dan K',
                'Membangun membran sel',
                'Melindungi organ vital',
                'Mendukung produksi hormon penting',
            ],
        };
        return benefits[getNutrientType()] || [];
    };

    const getShortTermEffects = (): string[] => {
        const effects: Record<string, string[]> = {
            calories: [
                'Kembung dan rasa tidak nyaman di perut',
                'Merasa lelah dan lesu setelah makan',
                'Kesulitan tidur (insomnia)',
                'Sembelit atau diare',
            ],
            protein: [
                'Dehidrasi karena tubuh membutuhkan lebih banyak air untuk memproses protein',
                'Kembung dan gas berlebih',
                'Sembelit (jika kurang serat)',
                'Rasa lelah dan lemah',
            ],
            carbs: [
                'Kenaikan gula darah yang cepat (spike)',
                'Rasa lapar kembali setelah beberapa waktu',
                'Lemas dan mudah lelah',
                'Sering buang air kecil',
            ],
            fat: [
                'Rasa kembung dan berat di perut',
                'Mual dan ingin muntah',
                'Diare atau gangguan pencernaan',
                'Rasa tidak nyaman dan lesu',
            ],
        };
        return effects[getNutrientType()] || [];
    };

    const getLongTermEffects = (): string[] => {
        const effects: Record<string, string[]> = {
            calories: [
                'Kenaikan berat badan yang berlebihan',
                'Obesitas',
                'Penyakit jantung dan pembuluh darah',
                'Diabetes tipe 2',
                'Tekanan darah tinggi (hipertensi)',
                'Kolesterol tinggi',
                'Penyakit hati berlemak (fatty liver)',
                'Gangguan pernapasan saat tidur (sleep apnea)',
                'Nyeri sendi (osteoarthritis)',
            ],
            protein: [
                'Gangguan fungsi ginjal dan kerusakan ginjal',
                'Penyakit batu ginjal',
                'Osteoporosis (tulang rapuh) karena kalsium ditarik dari tulang',
                'Gangguan hati',
                'Penyakit kardiovaskular',
                'Kanker usus besar',
                'Defisiensi nutrisi lain karena kurang variatifnya makanan',
            ],
            carbs: [
                'Diabetes tipe 2',
                'Resistensi insulin',
                'Kenaikan berat badan',
                'Penyakit jantung',
                'Peradangan kronis dalam tubuh',
                'Gangguan kognitif dan daya ingat menurun',
                'Penyakit periodontal (masalah gusi)',
                'Gangguan mood dan kecemasan',
            ],
            fat: [
                'Obesitas',
                'Penyakit jantung koroner',
                'Stroke',
                'Kolesterol tinggi (LDL)',
                'Penyempitan pembuluh darah (aterosklerosis)',
                'Penyakit hati berlemak',
                'Penyakit pankreas (pankreatitis)',
                'Gangguan empedu (batu empedu)',
                'Resiko kanker tertentu (payudara, usus, prostat)',
            ],
        };
        return effects[getNutrientType()] || [];
    };

    const getRecommendations = (): string[] => {
        const recommendations: Record<string, string[]> = {
            calories: [
                'Kurangi porsi makan dan makan lebih perlahan',
                'Pilih makanan yang lebih rendah kalori',
                'Tingkatkan aktivitas fisik dan olahraga',
                'Perbanyak konsumsi sayuran dan buah-buahan',
                'Hindari minuman manis dan makanan tinggi lemak',
            ],
            protein: [
                'Batasi asupan protein sesuai kebutuhan tubuh',
                'Perbanyak konsumsi air putih',
                'Pastikan mendapatkan cukup serat dari sayuran dan buah',
                'Pilih sumber protein yang seimbang (hewani dan nabati)',
                'Konsultasikan dengan ahli gizi jika punya kondisi medis tertentu',
            ],
            carbs: [
                'Pilih karbohidrat kompleks (gandum utuh, nasi merah, oat)',
                'Batasi gula dan karbohidrat sederhana',
                'Perbanyak serat dari buah dan sayuran',
                'Gunakan metode piring sehat (separuh sayur, seperempat karbo, seperempat protein)',
                'Perhatikan indeks glikemik makanan yang dikonsumsi',
            ],
            fat: [
                'Ganti lemak jenuh dengan lemak tak jenuh (alpukat, kacang-kacangan, minyak zaitun)',
                'Hindari makanan goreng dan fast food',
                'Baca label nutrisi dan perhatikan kandungan lemak',
                'Pilih metode memasak yang lebih sehat (rebus, kukus, panggang)',
                'Batasi konsumsi daging merah dan olahan',
            ],
        };
        return recommendations[getNutrientType()] || [];
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`rounded-full p-2 ${nutrition.bg}`}>
                            <IconComponent className={`h-6 w-6 ${nutrition.color}`} />
                        </div>
                        <DialogTitle className="text-xl">{nutrition.label}</DialogTitle>
                    </div>
                </DialogHeader>
                <div className="space-y-4 mt-2 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                    {hasPersonalizedData && (
                        <div className="rounded-lg bg-muted p-4">
                            <h4 className="font-semibold mb-2 text-sm">Target Harian Anda</h4>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Sudah dikonsumsi:</span>
                                <span className="text-sm font-semibold">{consumed} {nutrition.label === 'Kalori' ? 'kkal' : 'g'}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Target:</span>
                                <span className="text-sm font-semibold">{target} {nutrition.label === 'Kalori' ? 'kkal' : 'g'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Progress:</span>
                                <span className={`text-sm font-semibold ${consumed >= target && consumed <= target * 1.2 ? 'text-green-500' : consumed > target * 1.2 ? 'text-red-500' : 'text-amber-500'}`}>
                                    {Math.round((consumed / target) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3 overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${consumed >= target && consumed <= target * 1.2 ? 'bg-green-500' : consumed > target * 1.2 ? 'bg-red-500' : 'bg-amber-500'}`}
                                    style={{ width: `${Math.min((consumed / target) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold mb-1 text-sm">Apa itu {nutrition.label}?</h4>
                        <DialogDescription className="leading-relaxed">
                            {details.what}
                        </DialogDescription>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1 text-sm">Nilai apa ini?</h4>
                        <DialogDescription className="leading-relaxed">
                            {details.value}
                        </DialogDescription>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1 text-sm">Kenapa manusia perlu?</h4>
                        <DialogDescription className="leading-relaxed whitespace-pre-line">
                            {details.why}
                        </DialogDescription>
                    </div>
                    {/* Fulfillment Message */}
                    {hasPersonalizedData && consumed >= target && consumed <= target * 1.2 && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-1">
                                        {getFulfillmentTitle()}
                                    </h4>
                                    <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed mb-2">
                                        {getFulfillmentMessage()}
                                    </p>
                                    <div className="mt-2">
                                        <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Manfaat:</p>
                                        <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                                            {getFulfillmentBenefits().map((benefit, index) => (
                                                <li key={index} className="flex items-start gap-1">
                                                    <span className="text-green-600 dark:text-green-400">•</span>
                                                    <span>{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Excessive Intake Warning */}
                    {hasPersonalizedData && consumed > target * 1.2 && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="w-full">
                                    <h4 className="font-semibold text-sm text-red-900 dark:text-red-100 mb-1">
                                        Peringatan: Asupan Berlebih!
                                    </h4>
                                    <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed mb-3">
                                        Asupan {nutrition.label.toLowerCase()} Anda melebihi batas aman. Berikut adalah efek samping yang mungkin terjadi:
                                    </p>
                                    
                                    {/* Short term effects */}
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Efek Jangka Pendek:</p>
                                        <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                                            {getShortTermEffects().map((effect, index) => (
                                                <li key={index} className="flex items-start gap-1">
                                                    <span className="text-red-600 dark:text-red-400">•</span>
                                                    <span>{effect}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    {/* Long term effects */}
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Efek Jangka Panjang:</p>
                                        <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                                            {getLongTermEffects().slice(0, 4).map((effect, index) => (
                                                <li key={index} className="flex items-start gap-1">
                                                    <span className="text-red-600 dark:text-red-400">•</span>
                                                    <span>{effect}</span>
                                                </li>
                                            ))}
                                            {getLongTermEffects().length > 4 && (
                                                <li className="text-xs text-red-600 dark:text-red-400 italic">
                                                    ...dan {getLongTermEffects().length - 4} efek lainnya
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    
                                    {/* Recommendations */}
                                    <div className="rounded bg-red-100 dark:bg-red-900/50 p-3">
                                        <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Rekomendasi:</p>
                                        <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                                            {getRecommendations().slice(0, 3).map((rec, index) => (
                                                <li key={index} className="flex items-start gap-1">
                                                    <span className="text-red-600 dark:text-red-400">✓</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">Penting untuk diingat</h4>
                                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                    Kebutuhan nutrisi Anda akan meningkat seiring dengan tingkat aktivitas fisik. Semakin banyak aktivitas yang Anda lakukan, semakin banyak kalori dan nutrisi yang dibutuhkan tubuh untuk mendukung performa dan pemulihan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
