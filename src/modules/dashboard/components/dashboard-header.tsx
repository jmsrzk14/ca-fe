'use client';

import * as React from 'react';
import { Users, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { Button } from '@/shared/ui/button';
import { LanguageSwitcher } from '@/shared/components/language-switcher';

export function DashboardHeader() {
    const { setTheme, theme } = useTheme();
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname === '/') return { main: 'Dashboard', sub: 'Overview' };
        if (pathname.includes('/applications')) return { main: 'Pengajuan', sub: 'Pipeline' };
        if (pathname.includes('/loans')) {
            const pathParts = pathname.split('/').filter(Boolean);
            if (pathParts.length > 1) return { main: 'Peminjaman Kredit', sub: 'UMKM' };
            return { main: 'Pinjaman', sub: 'Daftar Peminjaman' };
        }
        if (pathname.includes('/slik')) return { main: 'SLIK', sub: 'Peminjaman Pending' };
        if (pathname.includes('/survey')) {
            if (pathname.includes('/general')) return { main: 'Survey', sub: 'Data Umum' };
            if (pathname.includes('/financial-analysis')) return { main: 'Survey', sub: 'Analisa Keuangan' };
            return { main: 'Survey', sub: 'Overview' };
        }
        return { main: 'Horizon', sub: 'Admin' };
    };

    const title = getPageTitle();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:bg-accent" />
            </div>


            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
