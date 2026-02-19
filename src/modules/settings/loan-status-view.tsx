'use client';

import * as React from 'react';
import {
    Search,
    Plus,
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

const LOAN_STATUSES = [
    { no: 1, namaStatus: "Pending", warna: "Warning", tampilan: "Pending", variant: "warning" },
    { no: 2, namaStatus: "Diterima", warna: "Success", tampilan: "Diterima", variant: "success" },
    { no: 3, namaStatus: "Ditolak", warna: "Danger", tampilan: "Ditolak", variant: "danger" },
    { no: 4, namaStatus: "Menunggu Pengecekan SLIK", warna: "Info", tampilan: "Menunggu Pengecekan SLIK", variant: "info" },
    { no: 5, namaStatus: "SLIK Sudah Diunggah", warna: "Info", tampilan: "SLIK Sudah Diunggah", variant: "info" },
    { no: 6, namaStatus: "Survey Data Umum Telah Diisi", warna: "Info", tampilan: "Survey Data Umum Telah Diisi", variant: "info" },
    { no: 7, namaStatus: "Survey Finansial Telah Diisi", warna: "Info", tampilan: "Survey Finansial Telah Diisi", variant: "info" }
];

export function LoanStatusView() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h2 className="text-sm font-bold text-foreground">Status Peminjaman</h2>
                </div>
                <Button className="bg-[#1e5adb] hover:bg-[#1e5adb]/90 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 px-6 h-10 text-xs">
                    Tambah Status Peminjaman
                </Button>
            </div>

            <Card className="border-border shadow-none bg-card overflow-hidden rounded-2xl">
                <CardContent className="p-0">
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

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="w-12 py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">No.</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-left">Nama Status</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-left">Warna</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-left">Tampilan</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {LOAN_STATUSES.map((row, i) => (
                                    <TableRow key={i} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                                        <TableCell className="py-5 px-4 text-center text-xs text-foreground/70">{row.no}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-medium text-foreground">{row.namaStatus}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-medium text-foreground/70">{row.warna}</TableCell>
                                        <TableCell className="py-5 px-4">
                                            <Badge className={cn(
                                                "border-none uppercase text-[9px] font-black px-2.5 py-1 rounded-md",
                                                row.variant === 'warning' && "bg-orange-500 text-white",
                                                row.variant === 'success' && "bg-green-500 text-white",
                                                row.variant === 'danger' && "bg-rose-500 text-white",
                                                row.variant === 'info' && "bg-cyan-500 text-white",
                                            )}>
                                                {row.tampilan}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-5 px-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-4 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all rounded-md border border-blue-200"
                                            >
                                                Ubah
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="px-8 py-6 border-t border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground font-medium">
                            Showing 1 to {LOAN_STATUSES.length} of {LOAN_STATUSES.length} entries
                        </span>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                                Previous
                            </Button>
                            <Button size="sm" className="h-8 w-8 p-0 bg-[#1e5adb] text-white font-bold">1</Button>
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
