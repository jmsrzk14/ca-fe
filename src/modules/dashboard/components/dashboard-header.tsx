'use client';

import * as React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/ui/button';
import { LanguageSwitcher } from '@/shared/components/language-switcher';
import { useAuth } from '@/lib/hooks/use-auth';
import { useSidebar } from './sidebar-context';

export function DashboardHeader() {
    const { setTheme, theme } = useTheme();
    const { user } = useAuth();
    const { toggleSidebar } = useSidebar();

    return (
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:bg-accent transition-colors"
                    onClick={toggleSidebar}
                >
                    <Menu className="h-8 w-8" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </div>

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
                    <span className="text-xs font-medium text-muted-foreground capitalize">
                        {user?.username ?? "—"}
                    </span>
                    <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-[11px] font-bold text-primary">
                            {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
