'use client';

import * as React from 'react';
import {
    Plus,
    Upload,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib/utils';

const SLIK_DATA = [
    {
        nik: '1202095400001011',
        name: 'Mesya Angeliga Hutagalung (Mesya)',
        status: 'Pending',
        kredit: 'UMKM'
    }
];

export function SlikView() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Header Section */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground text-gradient">
                        SLIK Pipeline
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button className="bg-[#1e5adb] hover:bg-[#1e5adb]/90 text-white gap-2 h-10 px-5 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-xs">
                        <Plus className="h-4 w-4" />
                        Ajukan SLIK
                    </Button>
                    <Button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-2 h-10 px-5 rounded-lg font-bold transition-all active:scale-95 text-xs">
                        <Upload className="h-4 w-4" />
                        Upload SLIK
                    </Button>
                </div>
            </div>

            <Card className="border-border shadow-none bg-card overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    {/* Inner Header with Title Group */}
                    <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 className="text-sm font-bold text-foreground">Daftar Peminjaman Pending</h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                Show
                                <Select defaultValue="10">
                                    <SelectTrigger className="h-9 w-[70px] bg-background/50 border-border/50 rounded-lg">
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

                            <div className="relative group min-w-[240px]">
                                <Input
                                    className="h-9 w-full pr-10 bg-background/50 border-border/50 rounded-lg text-xs focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                                    placeholder="Search NIK or Nama..."
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="w-16 py-4 px-6">
                                        <div className="flex items-center justify-center">
                                            <input type="checkbox" className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/20 cursor-pointer" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        NIK
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        Nama Lengkap
                                    </TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[11px] text-muted-foreground uppercase tracking-widest text-center">
                                        Status SLIK
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-bold text-[11px] text-muted-foreground uppercase tracking-widest text-right">
                                        Kredit
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {SLIK_DATA.map((row, i) => (
                                    <TableRow key={i} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                                        <TableCell className="py-5 px-6 text-center">
                                            <input type="checkbox" className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/20 cursor-pointer" />
                                        </TableCell>
                                        <TableCell className="py-5 px-4 font-mono text-xs text-foreground/80">
                                            {row.nik}
                                        </TableCell>
                                        <TableCell className="py-5 px-4 font-bold text-sm text-foreground">
                                            {row.name}
                                        </TableCell>
                                        <TableCell className="py-5 px-4 text-center">
                                            <Badge className="bg-orange-500/10 text-orange-500 border-none uppercase text-[10px] font-black px-2.5 py-1 rounded-md">
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-5 px-6 text-right font-black text-xs text-foreground/90">
                                            {row.kredit}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer / Pagination Section */}
                    <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-muted/10">
                        <div className="text-xs text-muted-foreground font-semibold">
                            Showing 1 to 1 of 1 entries
                        </div>
                        <div className="flex items-center bg-background/40 p-1 rounded-xl border border-border/50 shadow-inner">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs font-bold text-muted-foreground hover:bg-transparent hover:text-primary transition-all"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="h-8 w-8 text-xs font-black bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-lg mx-1"
                            >
                                1
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs font-bold text-muted-foreground hover:bg-transparent hover:text-primary transition-all"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Copyright Footer */}
            <div className="text-center pt-4 pb-12">
                <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    Copyright © 2024 <span className="text-foreground border-l border-border/50 pl-2">DIMENSI KREASI NUSANTARA</span>
                </p>
            </div>
        </div>
    );
}
