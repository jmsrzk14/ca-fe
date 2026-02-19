'use client';

import * as React from 'react';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";

const CRR_ASSESSMENTS = [
    { no: 1, tingkatResiko: "Sangat Rendah", kategori: "Sangat Layak", skorMinimum: "4.3", skorMaximum: "999,999.99" },
    { no: 2, tingkatResiko: "Rendah", kategori: "Layak", skorMinimum: "3.7", skorMaximum: "4.3" },
    { no: 3, tingkatResiko: "Cukup Rendah", kategori: "Cukup Layak", skorMinimum: "3.1", skorMaximum: "3.7" },
    { no: 4, tingkatResiko: "Tinggi", kategori: "Kurang Layak", skorMinimum: "2.5", skorMaximum: "3.1" },
    { no: 5, tingkatResiko: "Sangat Tinggi", kategori: "Sangat Kurang Layak", skorMinimum: "-999,999.99", skorMaximum: "2.5" }
];

export function CRRAssessmentView() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h2 className="text-sm font-bold text-foreground">Credit Risk Category</h2>
                </div>
                <Button className="bg-[#1e5adb] hover:bg-[#1e5adb]/90 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 px-6 h-10 text-xs">
                    Tambah Credit Risk Category
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
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-left">Tingkat Resiko</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-left">Kategori</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-left">Skor Minimum</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-left">Skor Maximum</TableHead>
                                    <TableHead className="py-4 px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {CRR_ASSESSMENTS.map((row, i) => (
                                    <TableRow key={i} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                                        <TableCell className="py-5 px-4 text-center text-xs text-foreground/70">{row.no}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-medium text-foreground">{row.tingkatResiko}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs font-medium text-foreground">{row.kategori}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs text-foreground/70">{row.skorMinimum}</TableCell>
                                        <TableCell className="py-5 px-4 text-xs text-foreground/70">{row.skorMaximum}</TableCell>
                                        <TableCell className="py-5 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-md border border-orange-200"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="px-8 py-6 border-t border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground font-medium">
                            Showing 1 to {CRR_ASSESSMENTS.length} of {CRR_ASSESSMENTS.length} entries
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
