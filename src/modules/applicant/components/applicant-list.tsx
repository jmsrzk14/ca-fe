'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Plus,
    Calendar,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
} from 'lucide-react';
import { t } from '@/shared/lib/t';

import { applicantService } from '@/core/api';
import { Applicant } from '@/shared/types/api';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import { ApplicantFormSheet } from './applicant-form-sheet';
import { ApplicantKanban } from './applicant-kanban';

export function ApplicantList() {
    const [search, setSearch] = React.useState('');
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<'table' | 'kanban'>('table');
    const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' | null }>({
        key: 'createdAt',
        direction: 'desc',
    });

    const [cursor, setCursor] = React.useState<string>('');
    const [cursorStack, setCursorStack] = React.useState<string[]>([]);
    const [pageSize, setPageSize] = React.useState<number>(10);

    const { data: response, isLoading, error, isPlaceholderData } = useQuery({
        queryKey: ['applicants', cursor, pageSize],
        queryFn: () => applicantService.list({ cursor, pageSize }),
        placeholderData: (previousData) => previousData,
    });

    const applicants: Applicant[] = React.useMemo(() => {
        const data = response as any;
        return (data?.applicants || data?.items || []) as Applicant[];
    }, [response]);

    const sortedApplicants = React.useMemo(() => {
        let items = [...applicants];

        if (search) {
            items = items.filter((app) =>
                app.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                app.identityNumber?.includes(search)
            );
        }

        if (sortConfig.key && sortConfig.direction) {
            items.sort((a: any, b: any) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'createdAt') {
                    aVal = aVal ? new Date(aVal).getTime() : 0;
                    bVal = bVal ? new Date(bVal).getTime() : 0;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return items;
    }, [applicants, search, sortConfig]);

    const handleNext = () => {
        if (response?.nextCursor) {
            setCursorStack((prev) => [...prev, cursor]);
            setCursor(response.nextCursor);
        }
    };

    const handleBack = () => {
        const prevStack = [...cursorStack];
        const lastCursor = prevStack.pop();
        setCursorStack(prevStack);
        setCursor(lastCursor || '');
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column || !sortConfig.direction) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
    };

    const renderContent = () => {
        if (viewMode === 'kanban') {
            return <ApplicantKanban applicants={sortedApplicants} />;
        }

        return (
            <>
                <div className="rounded-xl border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('identityNumber')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t`NIK / No. KTP`} <SortIcon column="identityNumber" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('fullName')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t`Nama`} <SortIcon column="fullName" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('applicantType')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t`Perorangan/Perusahaan`} <SortIcon column="applicantType" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t`Tanggal Dibuat`} <SortIcon column="createdAt" />
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedApplicants.length > 0 ? (
                                sortedApplicants.map((app: any) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="text-muted-foreground font-mono text-xs">
                                            {app.identityNumber}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/borrowers/${app.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                                                {app.fullName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={app.applicantType === 'CORPORATE' ? 'default' : 'secondary'} className="capitalize">
                                                {app.applicantType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                {app.createdAt ? new Date(app.createdAt).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="h-5 w-5 opacity-30" />
                                            <p className="text-sm">{t`Tidak ada data peminjam.`}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
                    <div className="text-xs text-muted-foreground">
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBack}
                                disabled={cursorStack.length === 0 || isLoading}
                                className="h-8 px-3 text-xs"
                            >
                                {t`Sebelumnya`}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNext}
                                disabled={!response?.hasNext || isLoading}
                                className="h-8 px-3 text-xs"
                            >
                                {t`Selanjutnya`}
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-8 w-[100px]" />
                </div>
                <div className="rounded-xl border">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-14 w-full border-b" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-foreground">{t`Peminjam`}</h1>
                    <Button size="sm" asChild>
                        <Link href="/borrowers/add">
                            <Plus className="h-3.5 w-3.5" />
                            {t`Tambah`}
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center rounded-xl border">
                    <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                        <X className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">{t`Gagal memuat data peminjam`}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                    >
                        {t`Coba lagi`}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{t`Peminjam`}</h1>
                </div>
                <Button size="sm" asChild>
                    <Link href="/borrowers/add">
                        <Plus className="h-3.5 w-3.5" />
                        {t`Tambah Peminjam Baru`}
                    </Link>
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t`Tampilkan`}</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            setPageSize(Number(value));
                            setCursor('');
                            setCursorStack([]);
                        }}
                    >
                        <SelectTrigger className="h-8 w-16 text-xs bg-transparent border-muted">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 25, 50, 100].map((size) => (
                                <SelectItem key={size} value={size.toString()} className="text-xs">
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">{t`entri`}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder={t`Cari nama atau NIK...`}
                            className="h-8 w-64 pl-8 text-xs rounded-md"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <ApplicantFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} />

            {renderContent()}
        </div>
    );
}
