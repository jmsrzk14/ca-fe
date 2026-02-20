'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/shared/ui/sonner';
import { I18nProvider } from '../i18n-provider';

export function RootProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <I18nProvider>
                <QueryProvider>
                    {children}
                    <Toaster />
                </QueryProvider>
            </I18nProvider>
        </ThemeProvider>
    );
}
