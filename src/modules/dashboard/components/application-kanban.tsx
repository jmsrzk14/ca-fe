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
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { KanbanColumn } from './kanban-column';
import { kanbanService } from '../services/kanban-service';
import { KanbanColumnData, ApplicationStatus, ApplicationCardData } from '../types/kanban';
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
    const [loanType, setLoanType] = React.useState('Personal Loan');
    const [viewMode, setViewMode] = React.useState<'board' | 'list'>('board');
    const [data, setData] = React.useState<KanbanColumnData[] | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [activeApp, setActiveApp] = React.useState<ApplicationCardData | null>(null);
    const [isNewAppDialogOpen, setIsNewAppDialogOpen] = React.useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const fetchData = React.useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const boardData = await kanbanService.getBoardData();
            setData(boardData);
            if (silent) toast.success('Data refreshed');
        } catch (error) {
            toast.error('Failed to fetch data');
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
        toast.info('Sorting toggled');
        // Simple toggle sort by name for demo
        setData(prev => {
            if (!prev) return prev;
            return prev.map(col => ({
                ...col,
                applications: [...col.applications].sort((a, b) => a.borrowerName.localeCompare(b.borrowerName))
            }));
        });
    };

    const handleNewApplication = () => {
        setIsNewAppDialogOpen(true);
    };

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Application') {
            setActiveApp(event.active.data.current.application);
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

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveApp(null);

        if (!over || !data) return;

        const activeId = active.id;
        const overId = over.id;

        const activeCol = data.find(col => col.applications.some(app => app.id === activeId));
        const overCol = data.find(col => col.applications.some(app => app.id === overId) || col.id === overId);

        if (!activeCol || !overCol) return;

        if (activeId !== overId) {
            setData(prev => {
                if (!prev) return prev;
                const col = prev.find(c => c.id === overCol.id);
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

        if (activeCol.id !== overCol.id) {
            toast.success(`Application stage updated`, {
                description: `${active.data.current?.application.borrowerName} moved to ${overCol.title}`,
                duration: 3000,
            });
        }
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

    const allApplications = data?.flatMap(col => col.applications) ?? [];

    return (
        <div className="flex flex-col gap-6 w-full h-full overflow-hidden animate-in fade-in duration-500">
            {/* Top Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground text-gradient">Application</h1>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 h-8 bg-muted/50 border-border/50 hover:bg-muted text-primary font-semibold transition-all hover:scale-105 active:scale-95">
                                {loanType === 'Personal Loan' && <User className="h-3.5 w-3.5" />}
                                {loanType === 'Mortgage' && <Home className="h-3.5 w-3.5" />}
                                {loanType === 'Auto Loan' && <Car className="h-3.5 w-3.5" />}
                                {loanType === 'Business Loan' && <Briefcase className="h-3.5 w-3.5" />}
                                <span className="text-xs">{loanType}</span>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 rounded-xl p-1.5 shadow-2xl border-border/50 backdrop-blur-2xl bg-popover/80">
                            <DropdownMenuItem onClick={() => setLoanType('Personal Loan')} className="rounded-lg gap-3 cursor-pointer py-2.5 hover:bg-primary/5 transition-colors">
                                <div className="p-1 rounded-md bg-primary/10">
                                    <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-medium">Personal Loan</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLoanType('Mortgage')} className="rounded-lg gap-3 cursor-pointer py-2.5 hover:bg-primary/5 transition-colors">
                                <div className="p-1 rounded-md bg-emerald-500/10">
                                    <Home className="h-3.5 w-3.5 text-emerald-500" />
                                </div>
                                <span className="text-sm font-medium">Mortgage</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLoanType('Auto Loan')} className="rounded-lg gap-3 cursor-pointer py-2.5 hover:bg-primary/5 transition-colors">
                                <div className="p-1 rounded-md bg-blue-500/10">
                                    <Car className="h-3.5 w-3.5 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium">Auto Loan</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLoanType('Business Loan')} className="rounded-lg gap-3 cursor-pointer py-2.5 hover:bg-primary/5 transition-colors">
                                <div className="p-1 rounded-md bg-purple-500/10">
                                    <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                                </div>
                                <span className="text-sm font-medium">Business Loan</span>
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
                            {data?.map((column) => (
                                <KanbanColumn key={column.id} column={column} />
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
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Borrower</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Ref Number</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Amount</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Stage</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Date</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allApplications.map((app) => (
                                        <TableRow key={app.id} className="hover:bg-muted/30 border-border/40 transition-colors group">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border border-border/50">
                                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                            {app.borrowerName.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-bold text-sm">{app.borrowerName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground bg-muted/20">
                                                    {app.refNumber}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 font-bold text-sm">
                                                {app.amount > 0 ? `$${app.amount.toLocaleString()}` : '$-'}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                                                    app.status === 'Collect Additional Data' && "bg-blue-500/10 text-blue-500",
                                                    app.status === 'Application in Progress' && "bg-purple-500/10 text-purple-500",
                                                    app.status === 'Review Required' && "bg-rose-500/10 text-rose-500",
                                                    app.status === 'Automated Decisioning' && "bg-orange-500/10 text-orange-500",
                                                    app.status === 'Offers Available' && "bg-emerald-500/10 text-emerald-500"
                                                )}>
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 text-xs text-muted-foreground font-medium">
                                                {app.date}
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
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
