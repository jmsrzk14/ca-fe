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
            console.log('--- Status Update Debug ---');
            console.log('Application ID:', activeId);
            console.log('Target Status (Column):', targetStatus);
            console.log('Payload structure:', { id: activeId, newStatus: targetStatus, reason: "" });

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
            <div className="flex flex-col gap-6 w-full h-full p-4 overflow-hidden">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-96" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex flex-col gap-4 min-w-[300px]">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-[500px] w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const allApplications = filteredData?.flatMap(col => col.applications) ?? [];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-in fade-in duration-500">
                <div className="p-6 bg-rose-500/10 text-rose-600 rounded-full ring-8 ring-rose-500/5">
                    <RotateCw className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Gagal memuat data pengajuan</h2>
                </div>
                <Button
                    onClick={() => fetchData()}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl gap-2 font-semibold shadow-lg shadow-orange-600/20"
                >
                    <RotateCw className="h-4 w-4" />
                    Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full h-full overflow-hidden animate-in fade-in duration-500">
            {/* Top Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground text-gradient">Pinjaman</h1>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 h-8 bg-muted/50 border-border/50 hover:bg-muted text-primary font-semibold transition-all hover:scale-105 active:scale-95">
                                {loanType === 'Personal' && <User className="h-3.5 w-3.5" />}
                                {loanType === 'Company' && <Briefcase className="h-3.5 w-3.5" />}
                                <span className="text-xs">{loanType}</span>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 rounded-xl p-1.5 shadow-2xl border-border/50 backdrop-blur-2xl bg-popover/80">
                            <DropdownMenuItem onClick={() => setLoanType('Personal')} className="rounded-lg gap-3 cursor-pointer py-2.5 hover:bg-primary/5 transition-colors">
                                <div className="p-1 rounded-md bg-primary/10">
                                    <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-medium">Personal</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLoanType('Company')} className="rounded-lg gap-3 cursor-pointer py-2.5 hover:bg-primary/5 transition-colors">
                                <div className="p-1 rounded-md bg-primary/10">
                                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-medium">Company</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search applications..."
                            className="pl-9 h-10 bg-muted/30 border-border/50 text-sm focus:bg-background transition-all focus:ring-1 focus:ring-primary/20"
                        />
                    </div>

                    <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            className={cn(
                                "h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all",
                                isRefreshing && "animate-spin text-primary"
                            )}
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSort}
                            className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 shadow-inner">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setViewMode('board')}
                                className={cn(
                                    "h-8 w-8 transition-all",
                                    viewMode === 'board' ? "bg-background shadow-md text-primary hover:bg-background" : "text-muted-foreground hover:bg-transparent hover:text-primary"
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "h-8 w-8 transition-all",
                                    viewMode === 'list' ? "bg-background shadow-md text-primary hover:bg-background" : "text-muted-foreground hover:bg-transparent hover:text-primary"
                                )}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            onClick={handleNewApplication}
                            className="h-10 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-600/20 transition-all active:scale-95 hover:-translate-y-0.5"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Pengajuan Baru
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {viewMode === 'board' ? (
                    <DndContext
                        sensors={sensors}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDragEnd={onDragEnd}
                    >
                        <div className="flex gap-6 min-w-max px-2">
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
                    <div className="px-2 mt-4 animate-in slide-in-from-bottom-4">
                        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-border/50">
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">NIK/NIB</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Nama Lengkap</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Branch</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Loan Amount</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Tenor</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Status</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allApplications.map((app) => (
                                        <TableRow
                                            key={app.id}
                                            onClick={() => router.push(`/loans/${app.id}`)}
                                            className="hover:bg-muted/30 border-border/40 transition-colors group cursor-pointer"
                                        >
                                            <TableCell className="py-4">
                                                {app.identityNumber}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {app.fullName}
                                            </TableCell>
                                            <TableCell className="py-4 text-sm font-medium">
                                                {app.branchCode || '—'}
                                            </TableCell>
                                            <TableCell className="py-4 font-bold text-sm">
                                                {app.amount > 0 ? `Rp ${app.amount.toLocaleString('id-ID')}` : 'Rp -'}
                                            </TableCell>
                                            <TableCell className="py-4 text-sm">
                                                {app.tenorMonths} bln
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                                                    app.status === 'INTAKE' && "bg-slate-500/10 text-slate-600",
                                                    app.status === 'ANALYSIS' && "bg-blue-500/10 text-blue-600",
                                                    app.status === 'SURVEY' && "bg-purple-500/10 text-purple-600",
                                                    app.status === 'COMMITTEE' && "bg-orange-500/10 text-orange-600",
                                                    app.status === 'APPROVED' && "bg-emerald-500/10 text-emerald-600",
                                                    app.status === 'REJECTED' && "bg-rose-500/10 text-rose-600",
                                                    app.status === 'DISBURSED' && "bg-teal-500/10 text-teal-600",
                                                    app.status === 'CANCELLED' && "bg-slate-500/10 text-slate-600",
                                                )}>
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 text-xs text-muted-foreground font-medium">
                                                {app.date}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
