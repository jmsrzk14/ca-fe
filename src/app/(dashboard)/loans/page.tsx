import { Suspense } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { LoanListView } from '@/modules/dashboard';

export default function LoansPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoanLoadingSkeleton />}>
                <LoanListView />
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
