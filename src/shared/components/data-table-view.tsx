'use client';

import * as React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

export interface DataTableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center';
}

export interface DataTableViewProps {
    title: string;
    addButtonLabel: string;
    onAdd?: () => void;
    columns: DataTableColumn[];
    data: Record<string, any>[];
    renderCell?: (row: Record<string, any>, column: DataTableColumn) => React.ReactNode;
    renderActions?: (row: Record<string, any>) => React.ReactNode;
}

export function DataTableView({
    title,
    addButtonLabel,
    onAdd,
    columns,
    data,
    renderCell,
    renderActions,
}: DataTableViewProps) {
    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            className="h-8 w-56 pl-8 text-xs rounded-md"
                            placeholder="Cari..."
                        />
                    </div>
                    <span className="text-xs text-muted-foreground px-1">
                        {data.length} data
                    </span>
                </div>
                <Button size="sm" onClick={onAdd}>
                    {addButtonLabel}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className={`${col.align === 'center' ? 'text-center' : ''} ${col.key === 'no' ? 'w-12' : ''}`}
                                >
                                    {col.label}
                                </TableHead>
                            ))}
                            {renderActions && (
                                <TableHead className="text-center">
                                    Aksi
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i}>
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.key}
                                        className={`${col.align === 'center' ? 'text-center' : ''} ${col.key === 'no' ? 'text-muted-foreground text-center' : ''}`}
                                    >
                                        {renderCell ? renderCell(row, col) : row[col.key]}
                                    </TableCell>
                                ))}
                                {renderActions && (
                                    <TableCell className="text-center">
                                        {renderActions(row)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-4 py-3 border-t">
                    <span>Showing 1–{data.length} of {data.length}</span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <span className="px-2 text-xs">1 / 1</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
