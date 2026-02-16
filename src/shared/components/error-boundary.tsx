'use client';

import * as React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button } from '@/shared/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in duration-500">
            <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                <AlertTriangle className="h-10 w-10" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Something went wrong</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
                {(error as Error)?.message || "An unexpected error occurred while loading this section."}
            </p>
            <div className="flex gap-4">
                <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="ghost">
                    Reload Page
                </Button>
            </div>
        </div>
    );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ReactErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ReactErrorBoundary>
    );
}
