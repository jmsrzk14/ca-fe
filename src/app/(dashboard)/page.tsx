import { Suspense } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { DashboardView } from '@/modules/dashboard';

export default function Page() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<DashboardLoadingSkeleton />}>
                <DashboardView />
            </Suspense>
        </ErrorBoundary>
    );
}


function DashboardLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-8 animate-pulse">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px] rounded-xl" />
                <Skeleton className="col-span-3 h-[400px] rounded-xl" />
            </div>
        </div>
    );
}
