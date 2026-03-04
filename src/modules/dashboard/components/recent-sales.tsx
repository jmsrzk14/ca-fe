'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { useRecentApplications } from '../hooks/use-dashboard-data';
import { Skeleton } from '@/shared/ui/skeleton';

export function RecentApplications() {
    const { data, isLoading, error } = useRecentApplications();

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (error) {
        return (
            <Card className="col-span-1 lg:col-span-4 border-border/50 bg-destructive/5 backdrop-blur-sm">
                <CardContent className="h-[300px] flex flex-col items-center justify-center text-center gap-2">
                    <p className="font-bold text-destructive">Gagal memuat pengajuan terbaru</p>
                    <p className="text-xs text-muted-foreground">Silakan periksa koneksi internet Anda.</p>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: string) => {
        const s = status.toUpperCase();
        switch (s) {
            case 'DISBURSED':
            case 'FUNDED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'APPROVED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'ANALYSIS':
            case 'INTAKE':
            case 'IN REVIEW': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'REJECTED':
            case 'DECLINED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'SURVEY': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'COMMITTEE': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <Card className="col-span-1 lg:col-span-4 border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Pengajuan Saya</CardTitle>
                <CardDescription>Pengajuan pinjaman yang baru ditugaskan</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider">Peminjam</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider">Jumlah</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((app) => (
                            <TableRow key={app.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-border/50">
                                            <AvatarImage src={app.applicant?.avatar} alt={app.applicant?.name} />
                                            <AvatarFallback>{app.applicant?.name?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{app.applicant?.name || 'Unknown Applicant'}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-mono font-bold">Rp. {app.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className={getStatusColor(app.status)}>
                                        {app.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
