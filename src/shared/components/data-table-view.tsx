'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
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
} from '@/shared/ui/select';

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
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h2 className="text-sm font-bold text-foreground">{title}</h2>
                </div>
                <Button
                    variant="default"
                    size="lg"
                    className="font-bold rounded-lg text-xs"
                    onClick={onAdd}
                >
                    {addButtonLabel}
                </Button>
            </div>

            <Card className="border-border shadow-none bg-card overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                            Show
                            <Select defaultValue="10">
                                <SelectTrigger className="h-8 w-[70px] bg-background border-border/50 rounded-lg">
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

                        <div className="relative group min-w-[260px]">
                            <Input
                                className="h-8 w-full pr-10 bg-background border-border/50 rounded-lg text-xs focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                                placeholder="Search..."
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-border/50">
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
                                    <TableRow key={i} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.key}
                                                className={`text-sm ${col.align === 'center' ? 'text-center' : ''} ${col.key === 'no' ? 'text-muted-foreground text-center' : ''}`}
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
                    </div>

                    <div className="px-4 py-3 border-t border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground font-medium">
                            Showing 1 to {data.length} of {data.length} entries
                        </span>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                                Previous
                            </Button>
                            <Button variant="default" size="sm" className="h-8 w-8 p-0 font-bold">
                                1
                            </Button>
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
