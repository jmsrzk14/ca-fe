'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    ExternalLink,
    Mail,
    Phone,
    Calendar,
    LayoutGrid,
    List,
    X,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { t } from '@lingui/macro';

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
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';

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

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['applicants'],
        queryFn: () => applicantService.list(),
    });

    const applicants: Applicant[] = React.useMemo(() => {
        return ((response as any)?.applicants || response?.items || []) as Applicant[];
    }, [response]);

    const sortedApplicants = React.useMemo(() => {
        let items = [...applicants];

        // Search Filter
        if (search) {
            items = items.filter((app) =>
                app.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                app.identityNumber?.includes(search)
            );
        }

        // Sorting
        if (sortConfig.key && sortConfig.direction) {
            items.sort((a: any, b: any) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Handle nested or special cases if needed
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
        if (sortConfig.key !== column || !sortConfig.direction) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-orange-600" /> : <ArrowDown className="h-4 w-4 text-orange-600" />;
    };

    const renderContent = () => {
        if (viewMode === 'kanban') {
            return <ApplicantKanban applicants={sortedApplicants} />;
        }

        return (
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead
                                className="py-4 font-bold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('fullName')}
                            >
                                <div className="flex items-center gap-2">
                                    {t`NAME`} <SortIcon column="fullName" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="py-4 font-bold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('applicantType')}
                            >
                                <div className="flex items-center gap-2">
                                    {t`TYPE`} <SortIcon column="applicantType" />
                                </div>
                            </TableHead>
                            <TableHead className="py-4 font-bold text-foreground outline-none">{t`CONTACT`}</TableHead>
                            <TableHead
                                className="py-4 font-bold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('createdAt')}
                            >
                                <div className="flex items-center gap-2">
                                    {t`CREATED`} <SortIcon column="createdAt" />
                                </div>
                            </TableHead>
                            <TableHead className="py-4 text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedApplicants.length > 0 ? (
                            sortedApplicants.map((app: any) => (
                                <TableRow key={app.id} className="group hover:bg-white/5 border-border/50 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 ring-2 ring-primary/5 group-hover:ring-orange-500/20 transition-all">
                                                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                                                    {app.fullName?.charAt(0) ?? 'A'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <Link href={`/borrowers/${app.id}`} className="font-bold text-foreground group-hover:text-orange-500 transition-colors">
                                                    {app.fullName}
                                                </Link>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {app.id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant={app.applicantType === 'CORPORATE' ? 'default' : 'secondary'} className="rounded-lg px-2 py-0.5">
                                            {app.applicantType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 text-muted-foreground text-sm">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-primary/60" />
                                                <span>{app.fullName?.toLowerCase().replace(/\s+/g, '.')}@example.com</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3 text-primary/60" />
                                                <span>+62 812-XXX-XXX</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Feb 19, 2026'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-orange-500/10 hover:text-orange-500">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl w-48 shadow-2xl">
                                                <DropdownMenuItem asChild className="gap-2 rounded-lg cursor-pointer">
                                                    <Link href={`/borrowers/${app.id}`}>
                                                        <ExternalLink className="h-4 w-4" />
                                                        {t`View Details`}
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Search className="h-8 w-8 opacity-20" />
                                        <p>{t`No applicants found.`}</p>
                                        <Button variant="link" className="text-orange-600 font-bold" onClick={() => setSearch('')}>
                                            {t`Clear search`}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-[300px]" />
                    <Skeleton className="h-10 w-[120px]" />
                </div>
                <div className="border rounded-xl">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full border-b" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="p-4 bg-destructive/10 text-destructive rounded-full">
                    <X className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{t`Failed to load applicants`}</h2>
                <p className="text-muted-foreground">{t`There was an error fetching the data. Please try again later.`}</p>
                <Button onClick={() => window.location.reload()}>{t`Retry`}</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t`Peminjam`}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl gap-2 font-semibold shadow-lg shadow-orange-600/20"
                        asChild
                    >
                        <Link href="/borrowers/add">
                            <Plus className="h-5 w-5" />
                            {t`Add Applicant`}
                        </Link>
                    </Button>
                </div>
            </div>

            <ApplicantFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} />

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t`Search by name or ID number...`}
                        className="pl-10 bg-background/50 border-border/50 rounded-xl focus-visible:ring-orange-500/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 shadow-inner">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewMode('table')}
                            className={cn(
                                "h-8 w-8 transition-all",
                                viewMode === 'table' ? "bg-background shadow-md text-primary hover:bg-background" : "text-muted-foreground hover:bg-transparent hover:text-primary"
                            )}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewMode('kanban')}
                            className={cn(
                                "h-8 w-8 transition-all",
                                viewMode === 'kanban' ? "bg-background shadow-md text-primary hover:bg-background" : "text-muted-foreground hover:bg-transparent hover:text-primary"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {renderContent()}
        </div>
    );
}
