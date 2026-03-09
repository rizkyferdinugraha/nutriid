import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import NutritionProfileController from '@/actions/App/Http/Controllers/Settings/NutritionProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profil Gizi',
        href: '/settings/nutrition-profile',
    },
];

interface NutritionProfileData {
    age: number | null;
    weight: number | null;
    height: number | null;
    gender: string | null;
}

export default function NutritionProfile() {
    const pageProps = usePage().props as {
        profile?: NutritionProfileData | null;
        status?: string;
    };
    const profile = pageProps.profile || null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Gizi" />

            <h1 className="sr-only">Profil Gizi</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profil Gizi"
                        description="Atur data pribadi Anda untuk target gizi yang dipersonalisasi"
                    />

                    <Form
                        {...NutritionProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="age">Usia</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            min="1"
                                            max="120"
                                            className="mt-1 block w-full"
                                            defaultValue={profile?.age ? String(profile.age) : ''}
                                            name="age"
                                            placeholder="Tahun"
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.age}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">Jenis Kelamin</Label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            defaultValue={profile?.gender ?? ''}
                                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Pilih jenis kelamin</option>
                                            <option value="male">Laki-laki</option>
                                            <option value="female">Perempuan</option>
                                        </select>
                                        <InputError
                                            className="mt-2"
                                            message={errors.gender}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="weight">Berat Badan</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            min="20"
                                            max="300"
                                            step="0.1"
                                            className="mt-1 block w-full"
                                            defaultValue={profile?.weight ? String(profile.weight) : ''}
                                            name="weight"
                                            placeholder="Kilogram"
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.weight}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="height">Tinggi Badan</Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            min="100"
                                            max="250"
                                            step="0.1"
                                            className="mt-1 block w-full"
                                            defaultValue={profile?.height ? String(profile.height) : ''}
                                            name="height"
                                            placeholder="Sentimeter"
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.height}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="save-nutrition-profile"
                                    >
                                        Simpan Profil
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Tersimpan
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}