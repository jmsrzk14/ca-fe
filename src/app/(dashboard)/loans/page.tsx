import { Suspense } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { ApplicationKanban } from '@/modules/dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pinjaman',
};

export default function LoansPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoanLoadingSkeleton />}>
                <div className="h-[calc(100vh-8rem)]">
                    <ApplicationKanban />
                </div>
            </Suspense>
        </ErrorBoundary>
    );
}

function LoanLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
    );
}
