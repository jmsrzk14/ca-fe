'use client';

import * as React from 'react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';

export function DocumentCompletenessTab() {
    const docs = [
        { name: 'KTP Peminjam', status: 'Ada', type: 'PDF', date: '13 Feb 2026' },
        { name: 'NPWP', status: 'Ada', type: 'IMG', date: '13 Feb 2026' },
        { name: 'Sertifikat Tanah (SHM)', status: 'Ada', type: 'PDF', date: '14 Feb 2026' },
        { name: 'Surat Keterangan Usaha', status: 'Ada', type: 'PDF', date: '13 Feb 2026' },
        { name: 'Slip Gaji / Rekening Koran', status: 'Tidak Ada', type: '-', date: '-' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Kelengkapan Dokumen
                </h2>
            </div>
            <div className="grid gap-4">
                {docs.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/30 hover:bg-muted/30 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs",
                                doc.status === 'Ada' ? "bg-primary/10 text-primary" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {doc.type !== '-' ? doc.type : '?'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">{doc.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">{doc.date}</span>
                            </div>
                        </div>
                        <Badge variant="outline" className={cn(
                            "uppercase text-[10px] font-bold border-none",
                            doc.status === 'Ada' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                            {doc.status}
                        </Badge>
                    </div>
                ))}
            </div>
        </div>
    );
}
