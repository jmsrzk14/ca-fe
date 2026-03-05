'use client';

import * as React from 'react';
import {
    Search,
    Plus,
    Filter,
    ArrowUpDown,
    LayoutGrid,
    List,
    RotateCw,
    ChevronDown,
    Home,
    Car,
    Briefcase,
    User,
    MoreHorizontal
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    TableHead
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { KanbanColumn } from './kanban-column';
import { kanbanService } from '../services/kanban-service';
import { KanbanColumnData, ApplicationStatus, ApplicationCardData } from '../types/kanban';
import { applicationService } from '@/core/api/services/application-service';
import { Skeleton } from '@/shared/ui/skeleton';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { ApplicationCard } from './application-card';
import { cn } from '@/shared/lib/utils';
import { ApplicationFormSheet } from './application-form-sheet';

export function ApplicationKanban() {
    const router = useRouter();
    const [loanType, setLoanType] = React.useState('Personal');
    const [viewMode, setViewMode] = React.useState<'board' | 'list'>('board');
    const [data, setData] = React.useState<KanbanColumnData[] | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [activeApp, setActiveApp] = React.useState<ApplicationCardData | null>(null);
    const [isNewAppDialogOpen, setIsNewAppDialogOpen] = React.useState(false);
    const [updatedCardId, setUpdatedCardId] = React.useState<string | null>(null);
    const [sourceStatus, setSourceStatus] = React.useState<ApplicationStatus | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const fetchData = React.useCallback(async (silent = false) => {
        if (!silent) {
            setIsLoading(true);
            setError(null);
        } else {
            setIsRefreshing(true);
        }

        try {
            const boardData = await kanbanService.getBoardData();
            setData(boardData);
            setError(null);
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to fetch data';
            if (!silent) {
                setError(errorMessage);
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData(true);
    };

    const handleSort = () => {
        if (!data) return;
        setData(prev => {
            if (!prev) return prev;
            return prev.map(col => ({
                ...col,
                applications: [...col.applications].sort((a, b) => b.amount - a.amount)
            }));
        });
    };

    const filteredData = React.useMemo(() => {
        if (!data) return null;
        return data.map(col => {
            const parsedType = loanType.toUpperCase();
            const matchingApps = col.applications.filter(app => {
                const appType = (app.applicantType || "UNKNOWN").toUpperCase();
                return appType === parsedType;
            });
            return {
                ...col,
                applications: matchingApps,
                count: matchingApps.length,
                totalAmount: matchingApps.reduce((sum, a) => sum + a.amount, 0)
            };
        });
    }, [data, loanType]);

    const handleNewApplication = () => {
        setIsNewAppDialogOpen(true);
    };

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Application') {
            const app = event.active.data.current.application;
            setActiveApp(app);
            setSourceStatus(app.status);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || !data) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAnApplication = active.data.current?.type === 'Application';
        const isOverAnApplication = over.data.current?.type === 'Application';
        const isOverAColumn = over.data.current?.type === 'Column';

        if (!isActiveAnApplication) return;

        // Dropping over another application
        if (isActiveAnApplication && isOverAnApplication) {
            setData(prev => {
                if (!prev) return prev;
                const activeCol = prev.find(col => col.applications.some(app => app.id === activeId));
                const overCol = prev.find(col => col.applications.some(app => app.id === overId));

                if (!activeCol || !overCol) return prev;

                if (activeCol.id !== overCol.id) {
                    const activeIndex = activeCol.applications.findIndex(app => app.id === activeId);
                    const overIndex = overCol.applications.findIndex(app => app.id === overId);

                    const movedApp = { ...activeCol.applications[activeIndex], status: overCol.id as ApplicationStatus };

                    const newActiveApps = [...activeCol.applications];
                    newActiveApps.splice(activeIndex, 1);

                    const newOverApps = [...overCol.applications];
                    newOverApps.splice(overIndex, 0, movedApp);

                    return prev.map(col => {
                        if (col.id === activeCol.id) return { ...col, applications: newActiveApps, count: newActiveApps.length, totalAmount: newActiveApps.reduce((sum, a) => sum + a.amount, 0) };
                        if (col.id === overCol.id) return { ...col, applications: newOverApps, count: newOverApps.length, totalAmount: newOverApps.reduce((sum, a) => sum + a.amount, 0) };
                        return col;
                    });
                }
                return prev;
            });
        }

        // Dropping over an empty column
        if (isActiveAnApplication && isOverAColumn) {
            setData(prev => {
                if (!prev) return prev;
                const activeCol = prev.find(col => col.applications.some(app => app.id === activeId));
                const overCol = prev.find(col => col.id === overId);

                if (!activeCol || !overCol || activeCol.id === overCol.id) return prev;

                const activeIndex = activeCol.applications.findIndex(app => app.id === activeId);
                const movedApp = { ...activeCol.applications[activeIndex], status: overCol.id as ApplicationStatus };

                const newActiveApps = [...activeCol.applications];
                newActiveApps.splice(activeIndex, 1);

                const newOverApps = [...overCol.applications, movedApp];

                return prev.map(col => {
                    if (col.id === activeCol.id) return { ...col, applications: newActiveApps, count: newActiveApps.length, totalAmount: newActiveApps.reduce((sum, a) => sum + a.amount, 0) };
                    if (col.id === overCol.id) return { ...col, applications: newOverApps, count: newOverApps.length, totalAmount: newOverApps.reduce((sum, a) => sum + a.amount, 0) };
                    return col;
                });
            });
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveApp(null);

        if (!over || !data || !sourceStatus) {
            setSourceStatus(null);
            return;
        }

        const activeId = active.id;
        const overId = over.id;

        // Find the OVER column even if dropping over an application card
        const overCol = data.find(col => col.applications.some(app => app.id === overId) || col.id === overId);

        if (!overCol) {
            setSourceStatus(null);
            return;
        }

        const targetStatus = overCol.id as ApplicationStatus;

        // 1. Reordering within the SAME column
        if (sourceStatus === targetStatus && activeId !== overId) {
            setData(prev => {
                if (!prev) return prev;
                const col = prev.find(c => c.id === targetStatus);
                if (!col) return prev;

                const oldIndex = col.applications.findIndex(app => app.id === activeId);
                const newIndex = col.applications.findIndex(app => app.id === overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newApps = arrayMove(col.applications, oldIndex, newIndex);
                    return prev.map(c => c.id === col.id ? { ...c, applications: newApps } : c);
                }
                return prev;
            });
        }

        // 2. Status Changed (Persistence Fix)
        if (sourceStatus !== targetStatus) {
            const loadingToastId = toast.loading(`Updating application status...`);

            try {
                await applicationService.updateStatus(activeId as string, targetStatus);

                // Trigger success animation
                setUpdatedCardId(activeId as string);
                setTimeout(() => setUpdatedCardId(null), 2000);

                toast.success(`Application stage updated`, {
                    id: loadingToastId,
                    description: `${active.data.current?.application.fullName ?? 'Application'} moved to ${overCol.title}`,
                    duration: 3000,
                });
            } catch (error) {
                toast.error(`Failed to update application status`, {
                    id: loadingToastId,
                    description: 'Reverting changes...',
                });
                // Revert the data on error
                fetchData(true);
            }
        }

        setSourceStatus(null);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-8 w-[300px]" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex flex-col gap-3 min-w-[280px]">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-[400px] w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const allApplications = filteredData?.flatMap(col => col.applications) ?? [];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                    <RotateCw className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Gagal memuat data pengajuan</p>
                <Button
                    onClick={() => fetchData()}
                    variant="outline"
                    size="sm"
                >
                    <RotateCw className="h-3.5 w-3.5" />
                    Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full h-full overflow-hidden">
            {/* Top Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-foreground">Pinjaman</h1>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                {loanType === 'Personal' && <User className="h-3.5 w-3.5" />}
                                {loanType === 'Company' && <Briefcase className="h-3.5 w-3.5" />}
                                {loanType}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setLoanType('Personal')} className="gap-2 cursor-pointer">
                                <User className="h-3.5 w-3.5" />
                                Personal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLoanType('Company')} className="gap-2 cursor-pointer">
                                <Briefcase className="h-3.5 w-3.5" />
                                Company
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Cari pengajuan..."
                            className="pl-8 h-8 w-64 text-xs rounded-md"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        className={cn(
                            "h-8 w-8 text-muted-foreground",
                            isRefreshing && "animate-spin text-primary"
                        )}
                    >
                        <RotateCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSort}
                        className="h-8 w-8 text-muted-foreground"
                    >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-md">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewMode('board')}
                            className={cn(
                                "h-7 w-7",
                                viewMode === 'board' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                            )}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "h-7 w-7",
                                viewMode === 'list' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                            )}
                        >
                            <List className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <Button
                        onClick={handleNewApplication}
                        size="sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Pengajuan Baru
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto pb-4">
                {viewMode === 'board' ? (
                    <DndContext
                        sensors={sensors}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDragEnd={onDragEnd}
                    >
                        <div className="flex gap-4 min-w-max">
                            {filteredData?.map((column) => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    updatedCardId={updatedCardId}
                                />
                            ))}
                        </div>

                        <DragOverlay dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: {
                                    active: {
                                        opacity: '0.4',
                                    },
                                },
                            }),
                        }}>
                            {activeApp ? (
                                <ApplicationCard application={activeApp} />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead>NIK/NIB</TableHead>
                                    <TableHead>Nama Lengkap</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Loan Amount</TableHead>
                                    <TableHead>Tenor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allApplications.length > 0 ? (
                                    allApplications.map((app) => (
                                        <TableRow
                                            key={app.id}
                                            onClick={() => router.push(`/loans/${app.id}`)}
                                            className="cursor-pointer"
                                        >
                                            <TableCell className="text-muted-foreground font-mono text-xs">
                                                {app.identityNumber}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {app.fullName}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {app.branchCode || '—'}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {app.amount > 0 ? `Rp ${app.amount.toLocaleString('id-ID')}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {app.tenorMonths} bln
                                            </TableCell>
                                            <TableCell>
                                                <LoanStatusBadge status={app.status} />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {app.date}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Search className="h-5 w-5 opacity-30" />
                                                <p className="text-sm">Tidak ada data pengajuan.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
            {/* Application Form Sheet */}
            <ApplicationFormSheet
                open={isNewAppDialogOpen}
                onOpenChange={setIsNewAppDialogOpen}
            />
        </div>
    );
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    INTAKE: { label: 'Intake', className: 'bg-slate-100 text-slate-600' },
    ANALYSIS: { label: 'Analisis', className: 'bg-blue-100 text-blue-700' },
    SURVEY: { label: 'Survey', className: 'bg-purple-100 text-purple-700' },
    COMMITTEE: { label: 'Committee', className: 'bg-amber-100 text-amber-700' },
    APPROVED: { label: 'Disetujui', className: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-700' },
    DISBURSED: { label: 'Dicairkan', className: 'bg-teal-100 text-teal-700' },
    CANCELLED: { label: 'Dibatalkan', className: 'bg-slate-100 text-slate-600' },
};

function LoanStatusBadge({ status }: { status?: string }) {
    const s = STATUS_MAP[status?.toUpperCase() || ''] || { label: status || '-', className: 'bg-muted text-muted-foreground' };
    return (
        <Badge variant="outline" className={`text-xs font-semibold border ${s.className}`}>
            {s.label}
        </Badge>
    );
}
