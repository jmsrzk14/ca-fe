'use client';

import * as React from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Info,
    Pencil,
    Download
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib/utils';
import { useRouter } from 'next/navigation';

const SURVEY_DATA = [
    {
        no: 1,
        nik: '1202095400001011',
        nama: 'Mesya Angeliga Hutagalung (Mesya)',
        kredit: 'UMKM',
        status: 'Pending',
        tglPengajuan: '13 February 2026',
        tglDiubah: '13 February 2026',
        diubahOleh: 'admin.smp'
    },
    {
        no: 2,
        nik: '3275091111040005',
        nama: 'Samuel Albi Pulo S',
        kredit: 'UMKM',
        status: 'Diterima',
        tglPengajuan: '4 December 2025',
        tglDiubah: '4 December 2025',
        diubahOleh: 'admin.smp'
    },
    {
        no: 3,
        nik: '320636010119910001',
        nama: 'Edwin Nabhani',
        kredit: 'UMKM',
        status: 'Diterima',
        tglPengajuan: '27 October 2025',
        tglDiubah: '27 October 2025',
        diubahOleh: 'admin.smp'
    },
    {
        no: 4,
        nik: '32072410980001',
        nama: 'ujang yusup',
        kredit: 'UMKM',
        status: 'Survey CRR Telah Diisi',
        tglPengajuan: '1 August 2025',
        tglDiubah: '7 October 2025',
        diubahOleh: 'admin.smp'
    },
    {
        no: 5,
        nik: '32072410980001',
        nama: 'ujang yusup',
        kredit: 'UMKM',
        status: 'Survey Data Umum Telah Diisi',
        tglPengajuan: '1 August 2025',
        tglDiubah: '7 October 2025',
        diubahOleh: 'admin.smp'
    },
    {
        no: 6,
        nik: '32072410980001',
        nama: 'ujang yusup',
        kredit: 'UMKM',
        status: 'Survey Data Umum Telah Diisi',
        tglPengajuan: '1 August 2025',
        tglDiubah: '7 October 2025',
        diubahOleh: 'admin.smp'
    },
    {
        no: 7,
        nik: '32072410980001',
        nama: 'ujang yusup',
        kredit: 'UMKM',
        status: 'Telah Dicek Komite',
        tglPengajuan: '25 July 2025',
        tglDiubah: '25 July 2025',
        diubahOleh: 'AO_002'
    },
    {
        no: 8,
        nik: '5454545453454354',
        nama: 'Ujang Yusup Nabhani',
        kredit: 'UMKM',
        status: 'Diterima',
        tglPengajuan: '9 July 2025',
        tglDiubah: '25 July 2025',
        diubahOleh: 'admin.smp'
    },
    {
        no: 9,
        nik: '3215142205920001',
        nama: 'Abdul Karim Rafsanjani',
        kredit: 'UMKM',
        status: 'Diterima',
        tglPengajuan: '3 July 2025',
        tglDiubah: '1 August 2025',
        diubahOleh: 'AO_001'
    },
    {
        no: 10,
        nik: '32072412970001',
        nama: 'EDWIN NUGRAHA',
        kredit: 'UMKM',
        status: 'Diterima',
        tglPengajuan: '30 June 2025',
        tglDiubah: '24 July 2025',
        diubahOleh: 'AO_001'
    }
];

export function SurveyView() {
    const router = useRouter();
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="border-border shadow-none bg-card overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    {/* Header Section */}
                    <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 className="text-sm font-bold text-foreground">Survey Data Umum</h2>
                        </div>
                    </div>

                    {/* Table Controls */}
                    <div className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                            Show
                            <Select defaultValue="10">
                                <SelectTrigger className="h-9 w-[70px] bg-background border-border/50 rounded-lg">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            entries
                        </div>

                        <div className="relative group min-w-[280px]">
                            <Input
                                className="h-9 w-full pr-10 bg-background border-border/50 rounded-lg text-xs focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                                placeholder="Search..."
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="w-12 py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest text-center">
                                        No.
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        NIK
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        Nama Lengkap
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        Kredit
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        Status
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        Tanggal Pengajuan
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        Tanggal Diubah
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        Diubah Oleh
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest text-center">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {SURVEY_DATA.map((row, i) => (
                                    <TableRow key={i} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                                        <TableCell className="py-5 px-4 text-center text-xs text-foreground/80">
                                            {row.no}
                                        </TableCell>
                                        <TableCell className="py-5 px-4 font-mono text-xs text-foreground/80">
                                            {row.nik}
                                        </TableCell>
                                        <TableCell className="py-5 px-4 font-bold text-sm text-foreground">
                                            {row.nama}
                                        </TableCell>
                                        <TableCell className="py-5 px-4 font-black text-xs text-foreground/90 uppercase">
                                            {row.kredit}
                                        </TableCell>
                                        <TableCell className="py-5 px-4">
                                            <Badge className={cn(
                                                "border-none uppercase text-[10px] font-black px-2.5 py-1 rounded-md",
                                                row.status === 'Pending' && "bg-orange-500/10 text-orange-500",
                                                row.status === 'Diterima' && "bg-emerald-500/10 text-emerald-500",
                                                row.status.includes('CRR') && "bg-blue-500/10 text-blue-500",
                                                row.status.includes('Data Umum') && "bg-cyan-500/10 text-cyan-500",
                                                row.status.includes('Komite') && "bg-indigo-500/10 text-indigo-500"
                                            )}>
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-semibold text-foreground/80">
                                            {row.tglPengajuan}
                                        </TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-semibold text-foreground/80">
                                            {row.tglDiubah}
                                        </TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-bold text-foreground">
                                            {row.diubahOleh}
                                        </TableCell>
                                        <TableCell className="py-5 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="icon"
                                                    onClick={() => router.push(`/survey/general/${row.nik}`)}
                                                    className="h-7 w-7 bg-amber-500 hover:bg-amber-600 border-none shadow-sm transition-transform active:scale-90 rounded-full"
                                                >
                                                    <Info className="h-3.5 w-3.5 text-white" />
                                                </Button>
                                                <Button size="icon" className="h-7 w-7 bg-blue-600 hover:bg-blue-700 border-none shadow-sm transition-transform active:scale-90 rounded-md">
                                                    <Pencil className="h-3.5 w-3.5 text-white" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/5">
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                            Showing 1 to 10 of 10 entries
                        </div>
                        <div className="flex items-center bg-background/40 p-1.5 rounded-xl border border-border/50 shadow-inner">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 text-xs font-black text-muted-foreground hover:bg-transparent hover:text-primary transition-all uppercase tracking-tighter"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 w-9 text-xs font-black bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-lg mx-1.5"
                            >
                                1
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 text-xs font-black text-muted-foreground hover:bg-transparent hover:text-primary transition-all uppercase tracking-tighter"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Premium Branding Footer */}
            <div className="text-center pt-4 pb-12">
                <p className="text-[10px] text-muted-foreground font-black tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    Copyright © 2024 <span className="w-1 h-3 bg-border"></span> <span className="text-foreground font-black">DIMENSI KREASI NUSANTARA</span>
                </p>
            </div>
        </div>
    );
}
