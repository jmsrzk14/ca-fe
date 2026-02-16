'use client';

import * as React from 'react';

export function FinancialInfoTab() {
    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Data Finansial
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 rounded-2xl bg-muted/20 border border-border space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pendapatan</h3>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Omzet Bulanan</span>
                        <span className="text-sm font-bold text-foreground">Rp 45.000.000</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Laba Bersih</span>
                        <span className="text-sm font-bold text-foreground">Rp 12.000.000</span>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-muted/20 border border-border space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pengeluaran</h3>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Biaya Operasional</span>
                        <span className="text-sm font-bold text-foreground">Rp 28.000.000</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Angsuran Lainnya</span>
                        <span className="text-sm font-bold text-foreground">Rp 5.000.000</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
