'use client';

import * as React from 'react';
import { Badge } from '@/shared/ui/badge';
import { CheckCircle2, Clock, FileText, UserCheck, AlertTriangle, Send } from 'lucide-react';

interface HistoryEntry {
    id: number;
    status: string;
    statusColor: string;
    comment: string;
    date: string;
    user: string;
    icon: React.ElementType;
}

const MOCK_HISTORY: HistoryEntry[] = [
    {
        id: 1,
        status: 'Diajukan',
        statusColor: 'bg-blue-500/10 text-blue-600',
        comment: 'Pengajuan kredit baru',
        date: '13 Feb 2026, 09:50 WIB',
        user: 'Sistem',
        icon: Send,
    },
    {
        id: 2,
        status: 'Verifikasi Dokumen',
        statusColor: 'bg-amber-500/10 text-amber-600',
        comment: 'Dokumen KTP dan KK sudah lengkap',
        date: '14 Feb 2026, 10:15 WIB',
        user: 'Rina Marlina',
        icon: FileText,
    },
    {
        id: 3,
        status: 'Survey Ditugaskan',
        statusColor: 'bg-purple-500/10 text-purple-600',
        comment: 'Ditugaskan ke surveyor lapangan',
        date: '15 Feb 2026, 08:30 WIB',
        user: 'Rina Marlina',
        icon: UserCheck,
    },
    {
        id: 4,
        status: 'Survey Selesai',
        statusColor: 'bg-indigo-500/10 text-indigo-600',
        comment: 'Hasil survey positif, usaha aktif dan produktif',
        date: '18 Feb 2026, 16:45 WIB',
        user: 'Budi Santoso',
        icon: CheckCircle2,
    },
    {
        id: 5,
        status: 'Analisis CRR',
        statusColor: 'bg-cyan-500/10 text-cyan-600',
        comment: 'Skor CRR: B+ (Good Risk Profile)',
        date: '19 Feb 2026, 11:20 WIB',
        user: 'Sistem',
        icon: AlertTriangle,
    },
    {
        id: 6,
        status: 'Pending Approval',
        statusColor: 'bg-amber-500/10 text-amber-600',
        comment: 'Menunggu persetujuan komite kredit',
        date: '20 Feb 2026, 09:00 WIB',
        user: 'Rina Marlina',
        icon: Clock,
    },
];

export function HistoryTab() {
    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-5">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                Histori Pengajuan
            </h2>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-0">
                    {MOCK_HISTORY.map((entry, i) => {
                        const Icon = entry.icon;
                        const isLast = i === MOCK_HISTORY.length - 1;
                        return (
                            <div key={entry.id} className="relative flex gap-4 pb-5">
                                {/* Icon dot */}
                                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border shrink-0">
                                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary" className={`${entry.statusColor} border-none font-bold text-[10px]`}>
                                            {entry.status}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                                    </div>
                                    <p className="text-xs text-foreground mt-1">{entry.comment}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">oleh {entry.user}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
