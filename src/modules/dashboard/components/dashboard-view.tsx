'use client';

import * as React from 'react';
import { AnalyticsCards } from './analytics-cards';
import { RevenueChart } from './revenue-chart';
import { RecentApplications } from './recent-sales';
import { DashboardTasks } from './dashboard-tasks';
import { Button } from '@/shared/ui/button';
import { PlusCircle, FileSpreadsheet } from 'lucide-react';

export function DashboardView() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Pinjaman</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitor portofolio Anda dan kelola pengajuan pinjaman aktif.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="hidden sm:flex border-border/50 bg-background/50 backdrop-blur-sm">
                        <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
                        Export Data
                    </Button>
                    <Button size="sm" className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Pengajuan Baru
                    </Button>
                </div>
            </div>

            <AnalyticsCards />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                <RecentApplications />
                <RevenueChart />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                <DashboardTasks />
                <div className="lg:col-span-4 rounded-xl border border-dashed border-border/60 bg-muted/5 flex flex-col items-center justify-center p-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <FileSpreadsheet className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold">Active Pipeline</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-2">
                        Your application pipeline activity will appear here. Start by processing your pending tasks.
                    </p>
                </div>
            </div>
        </div>
    );
}
