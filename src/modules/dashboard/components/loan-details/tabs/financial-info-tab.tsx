'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const fmtRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

// --- Mock Neraca (Balance Sheet) ---
const NERACA = {
    aktiva: [
        { label: 'Kas & Setara Kas', value: 18500000 },
        { label: 'Piutang Usaha', value: 12300000 },
        { label: 'Persediaan', value: 25000000 },
        { label: 'Aset Tetap', value: 85000000 },
        { label: 'Aset Lainnya', value: 5200000 },
    ],
    pasiva: [
        { label: 'Utang Usaha', value: 8500000 },
        { label: 'Utang Bank', value: 45200000 },
        { label: 'Utang Lainnya', value: 3500000 },
        { label: 'Modal Sendiri', value: 89800000 },
    ],
};

// --- Mock Laba Rugi (Income Statement) ---
const LABA_RUGI = [
    { label: 'Pendapatan / Omzet', value: 45000000, type: 'income' },
    { label: 'Harga Pokok Penjualan', value: -22000000, type: 'expense' },
    { label: 'Laba Kotor', value: 23000000, type: 'subtotal' },
    { label: 'Biaya Operasional', value: -8500000, type: 'expense' },
    { label: 'Biaya Gaji', value: -4500000, type: 'expense' },
    { label: 'Biaya Sewa & Utilitas', value: -2000000, type: 'expense' },
    { label: 'Laba Operasional', value: 8000000, type: 'subtotal' },
    { label: 'Pendapatan Lain-lain', value: 500000, type: 'income' },
    { label: 'Beban Bunga', value: -1200000, type: 'expense' },
    { label: 'Laba Bersih', value: 7300000, type: 'total' },
];

// --- Mock Cashflow ---
const CASHFLOW = [
    { label: 'Kas Awal Bulan', value: 15000000, type: 'subtotal' },
    { label: 'Penerimaan Usaha', value: 42000000, type: 'income' },
    { label: 'Penerimaan Lainnya', value: 500000, type: 'income' },
    { label: 'Pengeluaran Usaha', value: -28000000, type: 'expense' },
    { label: 'Angsuran Kredit', value: -5200000, type: 'expense' },
    { label: 'Pengeluaran Rumah Tangga', value: -6500000, type: 'expense' },
    { label: 'Kas Akhir Bulan', value: 17800000, type: 'total' },
];

// --- Ratios ---
const RATIOS = [
    { label: 'DSR (Debt Service Ratio)', value: '35.2%', icon: Percent, status: 'good' as const, note: '< 40% = Aman' },
    { label: 'Current Ratio', value: '2.14x', icon: Activity, status: 'good' as const, note: '> 1.5x = Sehat' },
    { label: 'Debt to Equity', value: '0.64x', icon: ShieldCheck, status: 'good' as const, note: '< 1.0x = Baik' },
    { label: 'Net Profit Margin', value: '16.2%', icon: TrendingUp, status: 'good' as const, note: '> 10% = Baik' },
    { label: 'Operating Expense Ratio', value: '66.7%', icon: TrendingDown, status: 'warning' as const, note: '< 60% = Ideal' },
    { label: 'Loan to Value', value: '72.5%', icon: DollarSign, status: 'good' as const, note: '< 80% = Aman' },
];

type StatementTab = 'neraca' | 'laba-rugi' | 'cashflow';

export function FinancialInfoTab() {
    const [activeStatement, setActiveStatement] = React.useState<StatementTab>('neraca');

    const tabs: { key: StatementTab; label: string }[] = [
        { key: 'neraca', label: 'Neraca' },
        { key: 'laba-rugi', label: 'Laba Rugi' },
        { key: 'cashflow', label: 'Arus Kas' },
    ];

    const totalAktiva = NERACA.aktiva.reduce((s, r) => s + r.value, 0);
    const totalPasiva = NERACA.pasiva.reduce((s, r) => s + r.value, 0);

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-5">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                Data Finansial
            </h2>

            {/* Ratio Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {RATIOS.map((r) => {
                    const Icon = r.icon;
                    return (
                        <Card key={r.label}>
                            <CardContent className="py-3 px-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`h-3.5 w-3.5 ${r.status === 'good' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                    <span className="text-[10px] text-muted-foreground font-medium truncate">{r.label}</span>
                                </div>
                                <p className="text-sm font-bold text-foreground">{r.value}</p>
                                <p className={`text-[10px] mt-0.5 ${r.status === 'good' ? 'text-emerald-600' : 'text-amber-600'}`}>{r.note}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Statement Tabs */}
            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card/30">
                <div className="flex border-b border-border bg-muted/30">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveStatement(tab.key)}
                            className={cn(
                                "px-4 py-2.5 text-xs font-bold transition-colors relative",
                                activeStatement === tab.key
                                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4">
                    {activeStatement === 'neraca' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Aktiva</h4>
                                <div className="space-y-0 border border-border rounded-lg overflow-hidden">
                                    {NERACA.aktiva.map((row) => (
                                        <div key={row.label} className="flex justify-between px-3 py-2 text-xs border-b border-border last:border-b-0 hover:bg-muted/30">
                                            <span className="text-foreground">{row.label}</span>
                                            <span className="font-medium text-foreground">{fmtRp(row.value)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between px-3 py-2 text-xs bg-muted/50 font-bold">
                                        <span>Total Aktiva</span>
                                        <span>{fmtRp(totalAktiva)}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pasiva</h4>
                                <div className="space-y-0 border border-border rounded-lg overflow-hidden">
                                    {NERACA.pasiva.map((row) => (
                                        <div key={row.label} className="flex justify-between px-3 py-2 text-xs border-b border-border last:border-b-0 hover:bg-muted/30">
                                            <span className="text-foreground">{row.label}</span>
                                            <span className="font-medium text-foreground">{fmtRp(row.value)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between px-3 py-2 text-xs bg-muted/50 font-bold">
                                        <span>Total Pasiva</span>
                                        <span>{fmtRp(totalPasiva)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStatement === 'laba-rugi' && (
                        <div className="border border-border rounded-lg overflow-hidden">
                            {LABA_RUGI.map((row) => (
                                <div
                                    key={row.label}
                                    className={cn(
                                        "flex justify-between px-3 py-2 text-xs border-b border-border last:border-b-0",
                                        row.type === 'total' ? 'bg-primary/5 font-bold text-foreground' :
                                        row.type === 'subtotal' ? 'bg-muted/30 font-bold text-foreground' :
                                        'hover:bg-muted/30'
                                    )}
                                >
                                    <span className={cn(
                                        row.type === 'expense' && 'pl-4 text-muted-foreground',
                                        (row.type === 'subtotal' || row.type === 'total') && 'text-foreground'
                                    )}>
                                        {row.label}
                                    </span>
                                    <span className={cn(
                                        'font-medium',
                                        row.value < 0 ? 'text-red-500' : 'text-foreground'
                                    )}>
                                        {row.value < 0 ? `(${fmtRp(Math.abs(row.value))})` : fmtRp(row.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeStatement === 'cashflow' && (
                        <div className="border border-border rounded-lg overflow-hidden">
                            {CASHFLOW.map((row) => (
                                <div
                                    key={row.label}
                                    className={cn(
                                        "flex justify-between px-3 py-2 text-xs border-b border-border last:border-b-0",
                                        row.type === 'total' ? 'bg-primary/5 font-bold text-foreground' :
                                        row.type === 'subtotal' ? 'bg-muted/30 font-bold text-foreground' :
                                        'hover:bg-muted/30'
                                    )}
                                >
                                    <span className={cn(
                                        row.type === 'expense' && 'pl-4 text-muted-foreground',
                                        (row.type === 'subtotal' || row.type === 'total') && 'text-foreground'
                                    )}>
                                        {row.label}
                                    </span>
                                    <span className={cn(
                                        'font-medium',
                                        row.value < 0 ? 'text-red-500' : 'text-foreground'
                                    )}>
                                        {row.value < 0 ? `(${fmtRp(Math.abs(row.value))})` : fmtRp(row.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
