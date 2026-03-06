'use client';

import * as React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Upload, Building2, Users, ChevronRight, AlertTriangle, CheckCircle2, CreditCard, TrendingDown } from 'lucide-react';
import { mockSlikData, mockSurveyDebts, slikToDebtEntries, formatRupiah } from '@/modules/credit-bureau/mock-data';
import { DebtEntry, KreditPembiayaan } from '@/modules/credit-bureau/types';
import { FacilityDetailDialog } from '@/modules/credit-bureau/components/facility-detail-dialog';
import Link from 'next/link';

const KONDISI_STYLE: Record<string, string> = {
    'Lancar': 'bg-emerald-500/10 text-emerald-600',
    'Lunas': 'bg-muted text-muted-foreground',
    'DPK': 'bg-amber-500/10 text-amber-600',
    'Kurang Lancar': 'bg-orange-500/10 text-orange-600',
    'Diragukan': 'bg-red-500/10 text-red-600',
    'Macet': 'bg-red-700/10 text-red-700',
};

export function DebtHistoryTab() {
    const [selectedFacility, setSelectedFacility] = React.useState<KreditPembiayaan | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const slikEntries = slikToDebtEntries(mockSlikData);
    const allEntries = [...slikEntries, ...mockSurveyDebts];
    const ringkasan = mockSlikData.individual.ringkasanFasilitas;

    const hasSlikData = slikEntries.length > 0;

    const handleRowClick = (entry: DebtEntry) => {
        if (entry.detail) {
            setSelectedFacility(entry.detail);
            setDialogOpen(true);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard
                    icon={<CreditCard className="h-4 w-4 text-blue-500" />}
                    label="Total Plafon"
                    value={formatRupiah(ringkasan.totalPlafon)}
                />
                <SummaryCard
                    icon={<TrendingDown className="h-4 w-4 text-amber-500" />}
                    label="Total Baki Debet"
                    value={formatRupiah(ringkasan.totalBakiDebet)}
                />
                <SummaryCard
                    icon={ringkasan.kondisiTerburuk === '1'
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        : <AlertTriangle className="h-4 w-4 text-red-500" />
                    }
                    label="Kondisi Terburuk"
                    value={`Kol ${ringkasan.kondisiTerburuk}`}
                />
                <SummaryCard
                    icon={<Building2 className="h-4 w-4 text-purple-500" />}
                    label="Jumlah Fasilitas"
                    value={`${ringkasan.jumlahFasilitas} dari ${ringkasan.jumlahPemberiKredit} kreditur`}
                />
            </div>

            {/* Credit Bureau Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                        <Building2 className="h-3.5 w-3.5" />
                        Credit Bureau (SLIK OJK)
                    </h3>
                    <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <Link href="/credit-bureau">
                            <Upload className="h-3 w-3" />
                            Upload SLIK
                        </Link>
                    </Button>
                </div>

                {hasSlikData ? (
                    <DebtTable entries={slikEntries} onRowClick={handleRowClick} clickable />
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <p className="text-sm text-muted-foreground mb-3">Belum ada data SLIK</p>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/credit-bureau">
                                    <Upload className="h-3.5 w-3.5" />
                                    Upload File SLIK
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Survey Section */}
            <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider mb-3">
                    <Users className="h-3.5 w-3.5" />
                    Survey (Utang Non-formal)
                </h3>
                {mockSurveyDebts.length > 0 ? (
                    <DebtTable entries={mockSurveyDebts} />
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <p className="text-sm text-muted-foreground">Belum ada data dari survey</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <FacilityDetailDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                facility={selectedFacility}
            />
        </div>
    );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <Card>
            <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{value}</p>
            </CardContent>
        </Card>
    );
}

function DebtTable({ entries, onRowClick, clickable }: { entries: DebtEntry[]; onRowClick?: (e: DebtEntry) => void; clickable?: boolean }) {
    return (
        <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card/30">
            <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-2.5 font-bold">Kreditur</th>
                        <th className="px-4 py-2.5 font-bold">Plafon</th>
                        <th className="px-4 py-2.5 font-bold">Baki Debet</th>
                        <th className="px-4 py-2.5 font-bold">Jatuh Tempo</th>
                        <th className="px-4 py-2.5 font-bold">Status</th>
                        {clickable && <th className="px-4 py-2.5 font-bold w-8"></th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {entries.map((entry) => (
                        <tr
                            key={entry.id}
                            onClick={() => onRowClick?.(entry)}
                            className={clickable ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}
                        >
                            <td className="px-4 py-3 font-semibold text-foreground">{entry.creditor}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{entry.plafon}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{entry.bakiDebet}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{entry.dueDate}</td>
                            <td className="px-4 py-3">
                                <Badge variant="secondary" className={`${KONDISI_STYLE[entry.status] || 'bg-muted text-muted-foreground'} border-none font-bold`}>
                                    {entry.status}
                                </Badge>
                            </td>
                            {clickable && (
                                <td className="px-4 py-3">
                                    {entry.detail && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
