import { Suspense } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { LoanDetailsView } from '@/modules/dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Detail Pinjaman',
};

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoanDetailLoadingSkeleton />}>
                <LoanDetailsView id={id} />
            </Suspense>
        </ErrorBoundary>
    );
}

function LoanDetailLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-pulse p-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
    );
}
