import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    const isOpen = usePage().props.sidebarOpen;
    const currentUserId = usePage().props.userId as number | undefined;
    const previousUserId = useRef<number | undefined>(currentUserId);

    // Clear localStorage when user changes
    useEffect(() => {
        if (previousUserId.current !== undefined && previousUserId.current !== currentUserId) {
            // User has changed, clear localStorage to prevent data leakage
            try {
                localStorage.clear();
                // Reload the page to ensure clean state
                window.location.reload();
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
            }
        }
        previousUserId.current = currentUserId;
    }, [currentUserId]);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
