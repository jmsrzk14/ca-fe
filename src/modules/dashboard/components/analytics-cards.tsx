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
            title: 'Active Loans',
            value: data.totalActiveLoans.toLocaleString(),
            change: `+${data.loansChange}% from prev month`,
            icon: Landmark,
            trend: 'up',
        },
        {
            title: 'Applications',
            value: data.activeApplications.toLocaleString(),
            change: `+${data.appsChange}% from prev month`,
            icon: FileText,
            trend: 'up',
        },
        {
            title: 'Total Funded',
            value: `$${(data.totalFunded / 1000000).toFixed(1)}M`,
            change: `+${data.fundedChange}% from prev month`,
            icon: Banknote,
            trend: 'up',
        },
        {
            title: 'Pending Tasks',
            value: data.pendingTasks.toLocaleString(),
            change: `${data.tasksChange}% since yesterday`,
            icon: ListTodo,
            trend: data.tasksChange < 0 ? 'down' : 'up',
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
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className={cn(
                                "flex items-center text-xs font-bold",
                                card.trend === 'up' ? "text-emerald-500" : "text-amber-500"
                            )}>
                                {card.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {Math.abs(parseFloat(card.change.split('%')[0]))}%
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                {card.change.split('%')[1].trim()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
