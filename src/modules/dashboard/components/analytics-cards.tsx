'use client';

import * as React from 'react';
import { Landmark, FileText, Banknote, ListTodo } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { useLoanAnalytics } from '../hooks/use-dashboard-data';
import { Skeleton } from '@/shared/ui/skeleton';

export function AnalyticsCards() {
    const { data, isLoading, isError } = useLoanAnalytics();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
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
            value: `${(data.totalFunded / 1000000).toFixed(1)}M`,
            icon: Banknote,
        },
        {
            title: 'Pending Bulan ini',
            value: data.pendingTasks.toLocaleString(),
            icon: ListTodo,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {card.title}
                            </p>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-3xl font-bold mt-1.5">{card.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
