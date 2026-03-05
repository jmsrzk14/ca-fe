'use client';

import * as React from 'react';
import { Users, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { LanguageSwitcher } from '@/shared/components/language-switcher';

export function DashboardHeader() {
    const { setTheme, theme } = useTheme();
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname === '/') return 'Dashboard';
        if (pathname.includes('/applications')) return 'Pengajuan';
        if (pathname.includes('/loans')) {
            const pathParts = pathname.split('/').filter(Boolean);
            if (pathParts.length > 1) return 'Detail Pengajuan';
            return 'Pinjaman';
        }
        if (pathname.includes('/slik')) return 'SLIK';
        if (pathname.includes('/survey')) return 'Survey';
        if (pathname.includes('/settings')) return 'Pengaturan';
        if (pathname.includes('/borrowers')) return 'Peminjam';
        return 'DOTS CA';
    };

    return (
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
            <h1 className="text-sm font-semibold text-foreground">{getPageTitle()}</h1>

            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-accent transition-colors cursor-pointer border border-transparent hover:border-border">
                    <span className="text-xs font-medium text-muted-foreground">admin.smp</span>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Users className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </header>
    );
}
