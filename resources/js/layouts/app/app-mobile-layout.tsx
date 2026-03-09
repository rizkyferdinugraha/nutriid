import { AppShell } from '@/components/app-shell';
import BottomNav from '@/components/bottom-nav';
import type { AppLayoutProps } from '@/types';

export default function AppMobileLayout({ children }: AppLayoutProps) {
    return (
        <AppShell variant="header" className="flex flex-col">
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
            <BottomNav />
        </AppShell>
    );
}