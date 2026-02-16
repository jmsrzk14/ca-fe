'use client';

import * as React from 'react';
import { Badge } from '@/shared/ui/badge';

export function DebtHistoryTab() {
    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Riwayat Hutang
                </h2>
            </div>
            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card/30">
                <table className="w-full text-left text-xs uppercase tracking-wider">
                    <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4 font-bold">Kreditur</th>
                            <th className="px-6 py-4 font-bold">Plafon</th>
                            <th className="px-6 py-4 font-bold">Baki Debet</th>
                            <th className="px-6 py-4 font-bold">Tgl Jatuh Tempo</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        <tr>
                            <td className="px-6 py-4 font-semibold text-foreground">Bank Mandiri</td>
                            <td className="px-6 py-4 font-medium text-foreground">Rp 20.000.000</td>
                            <td className="px-6 py-4 font-medium text-foreground">Rp 5.200.000</td>
                            <td className="px-6 py-4 font-medium text-foreground">15 Jan 2026</td>
                            <td className="px-6 py-4">
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none font-bold">Lancar</Badge>
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-semibold text-foreground">BRI</td>
                            <td className="px-6 py-4 font-medium text-foreground">Rp 10.000.000</td>
                            <td className="px-6 py-4 font-medium text-foreground">Rp 0</td>
                            <td className="px-6 py-4 font-medium text-foreground">10 Dec 2025</td>
                            <td className="px-6 py-4">
                                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold">Lunas</Badge>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
