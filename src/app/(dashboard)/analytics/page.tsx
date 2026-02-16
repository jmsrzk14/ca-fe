export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Analytics overview and performance metrics.</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="h-[200px] rounded-xl border bg-card p-6 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">1.2M</p>
                </div>
            </div>
        </div>
    );
}
