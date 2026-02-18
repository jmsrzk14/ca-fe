'use client';

import * as React from 'react';
import {
    Plus,
    Pencil,
    RotateCw,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';

// Import Tabs
import { BorrowerProfileTab } from './loan-details/tabs/borrower-profile-tab';
import { LoanInfoTab } from './loan-details/tabs/loan-info-tab';
import { DebtHistoryTab } from './loan-details/tabs/debt-history-tab';
import { DocumentCompletenessTab } from './loan-details/tabs/document-completeness-tab';
import { FinancialInfoTab } from './loan-details/tabs/financial-info-tab';
import { CRRTab } from './loan-details/tabs/crr-tab';
import { HistoryTab } from './loan-details/tabs/history-tab';

const TABS = [
    'Profil Peminjam',
    'Pinjaman',
    'Riwayat Hutang',
    'Kelengkapan Dokumen',
    'Finansial',
    'CRR',
    'Manajemen Risiko',
    'Komite',
    'History'
];

export function LoanDetailsView() {
    const [activeTab, setActiveTab] = React.useState('Profil Peminjam');
    const router = useRouter();

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Profil Peminjam':
                return (
                    <div className="flex flex-col gap-12">
                        <BorrowerProfileTab />
                    </div>
                );
            case 'Pinjaman': return <LoanInfoTab />;
            case 'Riwayat Hutang': return <DebtHistoryTab />;
            case 'Kelengkapan Dokumen': return <DocumentCompletenessTab />;
            case 'Finansial': return <FinancialInfoTab />;
            case 'CRR': return <CRRTab />;
            case 'Manajemen Risiko': return <CRRTab />;
            case 'Komite': return <HistoryTab />;
            case 'History': return <HistoryTab />;
            default: return <LoanInfoTab />;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Actions */}
            <div className="flex items-center justify-between px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-muted-foreground hover:text-foreground gap-2 font-bold uppercase text-[10px] tracking-widest group"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Kembali Ke Daftar
                </Button>
            </div>

            {/* Top Header Card */}
            <Card className="border-border shadow-none overflow-hidden bg-card rounded-2xl">
                <CardContent className="p-0">
                    <div className="p-8 border-b border-border/50 bg-muted/5">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h1 className="text-xl font-bold text-foreground">Detail Peminjaman: <span className="text-muted-foreground font-medium">UMKM</span></h1>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/50">
                        <div className="flex items-center gap-4 p-8 hover:bg-muted/30 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Diajukan</span>
                                <span className="text-sm font-semibold text-foreground">February 13, 2026 - 9:50 WIB</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 hover:bg-muted/50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Pencil className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Diubah</span>
                                <span className="text-sm font-semibold text-foreground">February 13, 2026 - 9:50 WIB</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 hover:bg-muted/50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <RotateCw className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase text-[10px] font-bold px-2 py-0">
                                        Pending
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Card */}
            <Card className="border-border shadow-sm min-h-[600px] bg-card">
                <CardContent className="p-0">
                    {/* Tabs */}
                    <div className="flex items-center border-b border-border px-6 overflow-x-auto no-scrollbar bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-4 text-xs font-semibold whitespace-nowrap transition-all relative",
                                    activeTab === tab
                                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {renderTabContent()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
