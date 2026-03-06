'use client';

import * as React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { ShieldCheck, Cpu, ClipboardCheck, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ScoreComponent {
    name: string;
    weight: number;
    score: number;
    maxScore: number;
    source: 'scorecard' | 'external-api';
    detail: string;
}

const MOCK_COMPONENTS: ScoreComponent[] = [
    { name: 'Riwayat Kredit (SLIK)', weight: 25, score: 22, maxScore: 25, source: 'external-api', detail: 'Kolektibilitas lancar 24 bulan, tidak ada tunggakan' },
    { name: 'Kapasitas Bayar (DSR)', weight: 20, score: 16, maxScore: 20, source: 'scorecard', detail: 'DSR 35.2% — dalam batas wajar' },
    { name: 'Profil Usaha', weight: 15, score: 12, maxScore: 15, source: 'scorecard', detail: 'Usaha aktif >3 tahun, omzet stabil' },
    { name: 'Agunan / Jaminan', weight: 15, score: 13, maxScore: 15, source: 'scorecard', detail: 'Coverage ratio 150%, jaminan berupa SHM' },
    { name: 'Karakter Debitur', weight: 10, score: 8, maxScore: 10, source: 'scorecard', detail: 'Hasil survey positif, reputasi baik' },
    { name: 'Kondisi Ekonomi', weight: 10, score: 7, maxScore: 10, source: 'external-api', detail: 'Sektor perdagangan stabil, inflasi terkendali' },
    { name: 'Lama Hubungan', weight: 5, score: 4, maxScore: 5, source: 'scorecard', detail: 'Nasabah existing >2 tahun' },
];

const GRADE_MAP: { min: number; grade: string; label: string; color: string }[] = [
    { min: 90, grade: 'A', label: 'Excellent', color: 'text-emerald-600' },
    { min: 80, grade: 'B+', label: 'Good', color: 'text-blue-600' },
    { min: 70, grade: 'B', label: 'Above Average', color: 'text-cyan-600' },
    { min: 60, grade: 'C+', label: 'Average', color: 'text-amber-600' },
    { min: 50, grade: 'C', label: 'Below Average', color: 'text-orange-600' },
    { min: 0, grade: 'D', label: 'Poor', color: 'text-red-600' },
];

export function CRRTab() {
    const totalScore = MOCK_COMPONENTS.reduce((sum, c) => sum + c.score, 0);
    const totalMax = MOCK_COMPONENTS.reduce((sum, c) => sum + c.maxScore, 0);
    const pct = Math.round((totalScore / totalMax) * 100);
    const grade = GRADE_MAP.find(g => pct >= g.min) || GRADE_MAP[GRADE_MAP.length - 1];

    const scorecardCount = MOCK_COMPONENTS.filter(c => c.source === 'scorecard').length;
    const apiCount = MOCK_COMPONENTS.filter(c => c.source === 'external-api').length;

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-5">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                Credit Risk Rating (CRR)
            </h2>

            {/* Score Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="md:col-span-1">
                    <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                        <div className={`text-4xl font-black ${grade.color}`}>{grade.grade}</div>
                        <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${grade.color}`}>{grade.label}</div>
                        <div className="text-2xl font-bold text-foreground mt-3">{totalScore}<span className="text-sm text-muted-foreground font-medium">/{totalMax}</span></div>
                        <div className="text-[10px] text-muted-foreground mt-1">Total Skor</div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <ClipboardCheck className="h-3 w-3" />
                                <span>Scorecard: {scorecardCount} komponen</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Cpu className="h-3 w-3" />
                                <span>External API: {apiCount} komponen</span>
                            </div>
                        </div>
                        {/* Score bars */}
                        <div className="space-y-2">
                            {MOCK_COMPONENTS.map((comp) => {
                                const compPct = Math.round((comp.score / comp.maxScore) * 100);
                                return (
                                    <div key={comp.name} className="group">
                                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                                            <span className="font-medium text-foreground truncate mr-2">{comp.name}</span>
                                            <span className="text-muted-foreground shrink-0">{comp.score}/{comp.maxScore}</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${compPct >= 80 ? 'bg-emerald-500' : compPct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${compPct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detail Table */}
            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card/30">
                <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-2.5 font-bold">Komponen</th>
                            <th className="px-4 py-2.5 font-bold w-20 text-center">Bobot</th>
                            <th className="px-4 py-2.5 font-bold w-20 text-center">Skor</th>
                            <th className="px-4 py-2.5 font-bold">Sumber</th>
                            <th className="px-4 py-2.5 font-bold">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {MOCK_COMPONENTS.map((comp) => (
                            <tr key={comp.name} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-semibold text-foreground">{comp.name}</td>
                                <td className="px-4 py-3 text-center text-muted-foreground">{comp.weight}%</td>
                                <td className="px-4 py-3 text-center font-bold text-foreground">{comp.score}/{comp.maxScore}</td>
                                <td className="px-4 py-3">
                                    <Badge variant="secondary" className={`border-none font-bold text-[10px] ${
                                        comp.source === 'scorecard'
                                            ? 'bg-blue-500/10 text-blue-600'
                                            : 'bg-purple-500/10 text-purple-600'
                                    }`}>
                                        {comp.source === 'scorecard' ? 'Scorecard' : 'External API'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{comp.detail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
