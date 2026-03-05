'use client';

import * as React from 'react';
import {
    Search,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
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
import { useRouter } from 'next/navigation';

const LOAN_DATA = [
    {
        no: 1,
        nik: "1202095400001011",
        nama: "Mesya Angeliqa Hutagalung (Mesya)",
        kredit: "UMKM",
        status: "Pending",
        tglPengajuan: "13 February 2026",
        tglDiubah: "13 February 2026",
        diubahOleh: "admin.smp",
        statusKlaim: "Belum Diklaim"
    },
    {
        no: 2,
        nik: "3275091111040005",
        nama: "Samuel Albi Pulo S",
        kredit: "UMKM",
        status: "Diterima",
        tglPengajuan: "4 December 2025",
        tglDiubah: "4 December 2025",
        diubahOleh: "admin.smp",
        statusKlaim: "Belum Diklaim"
    },
    {
        no: 3,
        nik: "320636010119910001",
        nama: "Edwin Nabhani",
        kredit: "UMKM",
        status: "Diterima",
        tglPengajuan: "27 October 2025",
        tglDiubah: "27 October 2025",
        diubahOleh: "admin.smp",
        statusKlaim: "Belum Diklaim"
    },
    {
        no: 4,
        nik: "5454545453454354",
        nama: "Ujang Yusup Nabhani",
        kredit: "UMKM",
        status: "Ditolak",
        tglPengajuan: "27 October 2025",
        tglDiubah: "27 October 2025",
        diubahOleh: "admin.smp",
        statusKlaim: "Belum Diklaim"
    },
    {
        no: 5,
        nik: "32072410980001",
        nama: "ujang yusup",
        kredit: "UMKM",
        status: "Survey CRR Telah Diisi",
        tglPengajuan: "1 August 2025",
        tglDiubah: "7 October 2025",
        diubahOleh: "admin.smp",
        statusKlaim: "Ditangani oleh AO_001"
    },
    {
        no: 6,
        nik: "32072410980001",
        nama: "ujang yusup",
        kredit: "UMKM",
        status: "Survey Data Umum Telah Diisi",
        tglPengajuan: "1 August 2025",
        tglDiubah: "7 October 2025",
        diubahOleh: "admin.smp",
        statusKlaim: "Belum Diklaim"
    },
    {
        no: 7,
        nik: "32072410980001",
        nama: "ujang yusup",
        kredit: "UMKM",
        status: "Survey Data Umum Telah Diisi",
        tglPengajuan: "1 August 2025",
        tglDiubah: "7 October 2025",
        diubahOleh: "admin.smp",
        statusKlaim: "Ditangani oleh AO_001"
    },
    {
        no: 8,
        nik: "32072410980001",
        nama: "ujang yusup",
        kredit: "UMKM",
        status: "Telah Dicek Komite",
        tglPengajuan: "25 July 2025",
        tglDiubah: "25 July 2025",
        diubahOleh: "AO_002",
        statusKlaim: "Ditangani oleh AO_002"
    },
    {
        no: 9,
        nik: "5454545453454354",
        nama: "Ujang Yusup Nabhani",
        kredit: "UMKM",
        status: "Diterima",
        tglPengajuan: "9 July 2025",
        tglDiubah: "25 July 2025",
        diubahOleh: "admin.smp",
        statusKlaim: "Belum Diklaim"
    },
    {
        no: 10,
        nik: "3215142205920001",
        nama: "Abdul Karim Rafsanjani",
        kredit: "UMKM",
        status: "Diterima",
        tglPengajuan: "3 July 2025",
        tglDiubah: "1 August 2025",
        diubahOleh: "AO_001",
        statusKlaim: "Ditangani oleh AO_001"
    }
];

export function LoanListView() {
    const router = useRouter();

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex gap-2 flex-wrap items-center">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="dd/mm/yyyy"
                            className="h-8 w-36 text-xs rounded-md pr-8"
                        />
                        <CalendarIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">—</span>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="dd/mm/yyyy"
                            className="h-8 w-36 text-xs rounded-md pr-8"
                        />
                        <CalendarIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <Button size="sm" className="h-8 text-xs">
                        Filter
                    </Button>
                    <span className="text-xs text-muted-foreground px-1">
                        {LOAN_DATA.length} pengajuan
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            className="h-8 w-56 pl-8 text-xs rounded-md"
                            placeholder="Cari nama atau NIK..."
                        />
                    </div>
                    <Button size="sm">
                        Ajukan Peminjaman
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-12 text-center">No.</TableHead>
                            <TableHead>NIK</TableHead>
                            <TableHead>Nama Lengkap</TableHead>
                            <TableHead>Kredit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tgl Pengajuan</TableHead>
                            <TableHead>Tgl Diubah</TableHead>
                            <TableHead>Diubah Oleh</TableHead>
                            <TableHead>Status Klaim</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {LOAN_DATA.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell className="text-center text-muted-foreground">{row.no}</TableCell>
                                <TableCell className="font-mono text-muted-foreground text-xs">{row.nik}</TableCell>
                                <TableCell className="font-medium">{row.nama}</TableCell>
                                <TableCell className="text-muted-foreground">{row.kredit}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "text-xs font-semibold border",
                                        row.status === 'Pending' && "bg-amber-100 text-amber-700 border-amber-200",
                                        row.status === 'Diterima' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                        row.status === 'Ditolak' && "bg-red-100 text-red-700 border-red-200",
                                        row.status.includes('Survey') && "bg-blue-100 text-blue-700 border-blue-200",
                                        row.status.includes('Komite') && "bg-slate-100 text-slate-700 border-slate-200",
                                    )}>
                                        {row.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{row.tglPengajuan}</TableCell>
                                <TableCell className="text-muted-foreground">{row.tglDiubah}</TableCell>
                                <TableCell>{row.diubahOleh}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "text-xs font-semibold border",
                                        row.statusKlaim === 'Belum Diklaim'
                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                            : "bg-amber-100 text-amber-700 border-amber-200"
                                    )}>
                                        {row.statusKlaim}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/loans/${row.no}`)}
                                        className="h-7 px-3 text-xs text-primary hover:text-primary"
                                    >
                                        Detail
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-4 py-3 border-t">
                    <span>Showing 1–10 of 11</span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <span className="px-2 text-xs">1 / 2</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
