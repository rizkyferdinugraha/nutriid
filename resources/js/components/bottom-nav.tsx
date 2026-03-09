import { Link, usePage } from '@inertiajs/react';
import { Brain, Camera, Home, History, Settings } from 'lucide-react';
import React from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Beranda', icon: Home },
    { href: '/scan', label: 'Scan', icon: Camera },
    { href: '/analysis', label: 'Analisis', icon: Brain },
    { href: '/history', label: 'Riwayat', icon: History },
    { href: '/settings/profile', label: 'Pengaturan', icon: Settings },
];

export default function BottomNav() {
    const { url } = usePage();

    const isActive = (href: string) => {
        if (href === '/dashboard' && url === '/dashboard') return true;
        if (href === '/scan' && url === '/scan') return true;
        if (href === '/analysis' && url === '/analysis') return true;
        if (href === '/history' && url === '/history') return true;
        if (href === '/settings/profile' && url.startsWith('/settings')) return true;
        return false;
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-around px-4">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5px]' : ''}`} />
                            <span className={`text-xs ${active ? 'font-medium' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}