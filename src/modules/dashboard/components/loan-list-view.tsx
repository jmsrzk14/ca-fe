'use client';

import * as React from 'react';
import {
    Search,
    Plus,
    Calendar as CalendarIcon,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    FileText,
    Download
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
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h2 className="text-sm font-bold text-foreground">Daftar Peminjaman</h2>
                </div>
                <Button className="bg-[#1e5adb] hover:bg-[#1e5adb]/90 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 px-6 h-10 text-xs">
                    Ajukan Peminjaman
                </Button>
            </div>

            <Card className="border-border shadow-none bg-card overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    {/* Filters Section */}
                    <div className="p-8 border-b border-border/50 bg-muted/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tanggal Mulai</label>
                                <div className="relative group">
                                    <Input
                                        type="text"
                                        placeholder="hh/bb/tttt"
                                        className="h-11 bg-background border-border/50 rounded-xl pr-10 text-xs"
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tanggal Akhir</label>
                                <div className="relative group">
                                    <Input
                                        type="text"
                                        placeholder="hh/bb/tttt"
                                        className="h-11 bg-background border-border/50 rounded-xl pr-10 text-xs"
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <Button className="w-full h-11 bg-[#1e5adb] hover:bg-[#1e5adb]/90 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 uppercase tracking-widest text-[10px]">
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Search & Entries */}
                    <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
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

                        <div className="relative group min-w-[300px]">
                            <Input
                                className="h-9 w-full pr-10 bg-background border-border/50 rounded-lg text-xs focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                                placeholder="Search..."
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="w-12 py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">No.</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">NIK</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Nama Lengkap</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Kredit</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Tanggal Pengajuan</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Tanggal Diubah</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Diubah Oleh</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Status Klaim</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {LOAN_DATA.map((row, i) => (
                                    <TableRow key={i} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                                        <TableCell className="py-5 px-4 text-center text-xs text-foreground/70">{row.no}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-mono text-foreground/70">{row.nik}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-bold text-foreground">{row.nama}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-black uppercase text-foreground/80">{row.kredit}</TableCell>
                                        <TableCell className="py-5 px-4">
                                            <Badge className={cn(
                                                "border-none uppercase text-[9px] font-black px-2.5 py-1 rounded-md",
                                                row.status === 'Pending' && "bg-orange-500/10 text-orange-600",
                                                row.status === 'Diterima' && "bg-green-500/10 text-green-600",
                                                row.status === 'Ditolak' && "bg-rose-500/10 text-rose-600",
                                                row.status.includes('Survey') && "bg-blue-500/10 text-blue-600",
                                                row.status.includes('Komite') && "bg-cyan-500/10 text-cyan-600",
                                            )}>
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-5 px-4 text-xs text-foreground/70">{row.tglPengajuan}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs text-foreground/70">{row.tglDiubah}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-medium text-foreground/80">{row.diubahOleh}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-semibold">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-md text-[10px] font-bold",
                                                row.statusKlaim === 'Belum Diklaim' ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                                            )}>
                                                {row.statusKlaim}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-5 px-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/loans/${row.no}`)}
                                                className="h-8 px-4 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all rounded-md border border-blue-200"
                                            >
                                                Detail
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="px-8 py-6 border-t border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground font-medium">
                            Showing 1 to 10 of 11 entries
                        </span>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                                Previous
                            </Button>
                            <Button size="sm" className="h-8 w-8 p-0 bg-[#1e5adb] text-white font-bold">1</Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">2</Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary font-bold">
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
