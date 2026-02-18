'use client';

import * as React from 'react';
import { Landmark, FileText, Banknote, ListTodo, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useLoanAnalytics } from '../hooks/use-dashboard-data';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';

export function AnalyticsCards() {
    const { data, isLoading, isError } = useLoanAnalytics();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl border border-border" />
                ))}
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                Failed to load analytics data.
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Data Pengajuan',
            value: data.totalActiveLoans.toLocaleString(),
            icon: Landmark,
        },
        {
            title: 'Total Kredit yang ada',
            value: data.activeApplications.toLocaleString(),
            icon: FileText,
        },
        {
            title: 'Total Kredit di bulan ini',
            value: `$${(data.totalFunded / 1000000).toFixed(1)}M`,
            icon: Banknote,
        },
        {
            title: 'Pending Bulan ini',
            value: data.pendingTasks.toLocaleString(),
            icon: ListTodo,
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="relative overflow-hidden transition-all hover:shadow-lg bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {card.title}
                        </CardTitle>
                        <div className="rounded-lg bg-primary/10 p-2.5 text-primary shadow-inner">
                            <card.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
