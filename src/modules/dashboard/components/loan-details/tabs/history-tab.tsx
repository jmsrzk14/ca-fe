'use client';

import * as React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function HistoryTab() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Status Log
                </h2>
            </div>

            <div className="border border-border rounded-xl bg-card/30 overflow-hidden shadow-sm">
                {/* Table Controls */}
                <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        Show
                        <Select defaultValue="10">
                            <SelectTrigger className="h-8 w-[70px] bg-background">
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

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Search:</span>
                        <Input
                            className="h-8 w-64 bg-background"
                            placeholder="..."
                        />
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="w-16 font-bold text-xs uppercase text-foreground py-4">No.</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-foreground py-4">Status</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-foreground py-4">Komentar</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-foreground py-4">Tanggal Diubah</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-foreground py-4">Diubah Oleh</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-border hover:bg-muted/30 transition-colors">
                                <TableCell className="text-sm font-medium py-4">1</TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase text-[10px] font-bold px-3 py-0.5">
                                        Pending
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-foreground py-4">-</TableCell>
                                <TableCell className="text-sm font-medium text-foreground py-4">February 13, 2026 - 9:50 WIB</TableCell>
                                <TableCell className="text-sm font-bold text-foreground py-4">Sistem</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
                    <div className="text-xs text-muted-foreground font-medium">
                        Showing 1 to 1 of 1 entries
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3 opacity-50 cursor-not-allowed">
                            Previous
                        </Button>
                        <Button variant="default" size="sm" className="h-8 w-8 text-xs font-bold bg-primary text-primary-foreground">
                            1
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3 opacity-50 cursor-not-allowed">
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
