'use client';

import * as React from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardHeader } from './dashboard-header';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen w-full bg-background font-sans antialiased selection:bg-primary/20 overflow-hidden">
            <DashboardSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
                    <div className="mx-auto flex w-full flex-col gap-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
