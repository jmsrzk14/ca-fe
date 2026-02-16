'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/shared/ui/sonner';

export function RootProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <QueryProvider>
                {children}
                <Toaster />
            </QueryProvider>
        </ThemeProvider>
    );
}
