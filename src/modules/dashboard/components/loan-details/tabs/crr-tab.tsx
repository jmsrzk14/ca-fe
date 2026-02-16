'use client';

import * as React from 'react';

export function CRRTab() {
    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Credit Risk Rating (CRR)
                </h2>
            </div>
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-primary/5 border border-primary/10">
                <div className="text-5xl font-black text-primary mb-2">B+</div>
                <div className="text-sm font-bold text-primary/70 uppercase tracking-widest mb-4">Good Risk Profile</div>
                <div className="max-w-md text-xs text-muted-foreground">
                    Skor CRR dihitung berdasarkan data SLIK, profil usaha, dan kemampuan finansial dalam 12 bulan terakhir.
                </div>
            </div>
        </div>
    );
}
