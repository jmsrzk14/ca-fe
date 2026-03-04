'use client';

import * as React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { t } from '@/shared/lib/t';

export default function DashboardSettingsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <LayoutDashboard className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t`Atur Dashboard`}</h1>
                    <p className="text-muted-foreground">{t`Konfigurasi kartu dan tampilan pada halaman dashboard utama.`}</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                    <LayoutDashboard className="h-12 w-12 text-muted-foreground/30" />
                    <h2 className="text-xl font-bold text-foreground">{t`Fitur Dalam Pengembangan`}</h2>
                    <p className="text-muted-foreground max-w-md">
                        {t`Halaman antarmuka untuk mengatur layout dan visibilitas card dashboard sedang dipersiapkan.`}
                    </p>
                </div>
            </div>
        </div>
    );
}
