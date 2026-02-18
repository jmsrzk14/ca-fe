'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/shared/ui/sidebar';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardHeader } from './dashboard-header'; // This import remains as DashboardHeader is now in its own file

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SidebarProvider defaultOpen>
            <div className="flex h-screen w-full bg-background font-sans antialiased selection:bg-primary/20 overflow-hidden">
                <DashboardSidebar />
                <SidebarInset className="flex flex-col bg-transparent overflow-hidden">
                    <DashboardHeader />
                    <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
                        <div className="mx-auto flex w-full flex-col gap-6">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
