'use client';

import * as React from 'react';
import { Pencil, ArrowLeft } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        <div className="space-y-5 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Kembali
                    </Button>
                    <h1 className="text-lg font-bold text-foreground">Detail Survey</h1>
                </div>
                <Button size="sm">
                    <Pencil className="h-3.5 w-3.5" />
                    Isi Survey
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-12 text-center">No.</TableHead>
                            <TableHead>Pertanyaan</TableHead>
                            <TableHead className="text-center">Keterangan</TableHead>
                            <TableHead className="text-center">Dokumen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {SURVEY_QUESTIONS.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell className="text-center text-muted-foreground">
                                    {row.no}
                                </TableCell>
                                <TableCell className="font-medium max-w-md">
                                    {row.pertanyaan}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                    {row.keterangan}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                    {row.dokumen}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
