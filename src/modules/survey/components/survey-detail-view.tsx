'use client';

import * as React from 'react';
import { Pencil, ChevronLeft } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { useRouter } from 'next/navigation';

const SURVEY_QUESTIONS = [
    {
        no: 1,
        pertanyaan: 'Silakan Unggah Foto KTP Nasabah',
        keterangan: '—',
        dokumen: '—'
    },
    {
        no: 2,
        pertanyaan: 'Silakan Unggah Foto KTP Pasangan Nasabah',
        keterangan: '—',
        dokumen: '—'
    },
    {
        no: 3,
        pertanyaan: 'Silakan Unggah Foto Kartu Keluarga (KK) Nasabah',
        keterangan: '—',
        dokumen: '—'
    },
    {
        no: 4,
        pertanyaan: 'Silakan Unggah Foto Fisik Rumah Nasabah Saat Ini',
        keterangan: '—',
        dokumen: '—'
    },
    {
        no: 5,
        pertanyaan: 'Silakan Unggah Foto yang Membuktikan Pekerjaan Anda Saat Ini',
        keterangan: '—',
        dokumen: '—'
    }
];

export function SurveyDetailView() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Actions */}
            <div className="flex items-center justify-between px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-muted-foreground hover:text-foreground gap-2 font-bold uppercase text-[10px] tracking-widest"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Kembali
                </Button>

                <Button className="bg-[#1e5adb] hover:bg-[#1e5adb]/90 text-white gap-2 h-10 px-5 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-xs">
                    <Pencil className="h-4 w-4" />
                    Isi Survey
                </Button>
            </div>

            <Card className="border-border shadow-none bg-card overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    {/* Title Section */}
                    <div className="p-6 border-b border-border/50 flex items-center gap-3 bg-transparent">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-sm font-bold text-foreground">Detail Survey</h2>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="w-16 py-4 px-6 font-bold text-[11px] text-muted-foreground uppercase tracking-widest text-center">
                                        No.
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                                        Pertanyaan
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-bold text-[11px] text-muted-foreground uppercase tracking-widest text-center">
                                        Keterangan
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-bold text-[11px] text-muted-foreground uppercase tracking-widest text-center">
                                        Dokumen
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {SURVEY_QUESTIONS.map((row, i) => (
                                    <TableRow key={i} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                                        <TableCell className="py-5 px-6 text-center text-xs text-foreground/80 font-medium">
                                            {row.no}
                                        </TableCell>
                                        <TableCell className="py-5 px-6 font-semibold text-sm text-foreground/90 leading-relaxed max-w-md">
                                            {row.pertanyaan}
                                        </TableCell>
                                        <TableCell className="py-5 px-6 text-center text-xs text-muted-foreground font-medium">
                                            {row.keterangan}
                                        </TableCell>
                                        <TableCell className="py-5 px-6 text-center text-xs text-muted-foreground font-medium">
                                            {row.dokumen}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Empty Space for spacing consistency */}
                    <div className="h-8" />
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
