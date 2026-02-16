'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { usePendingTasks } from '../hooks/use-dashboard-data';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function DashboardTasks() {
    const { data, isLoading } = usePendingTasks();

    if (isLoading) {
        return <Skeleton className="h-[300px] w-full rounded-xl" />;
    }

    return (
        <Card className="col-span-1 lg:col-span-3 border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold">My Tasks</CardTitle>
                <CardDescription>Actions requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data?.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-all group"
                        >
                            <div className="mt-0.5">
                                {task.status === 'Completed' ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium leading-none",
                                    task.status === 'Completed' && "line-through text-muted-foreground"
                                )}>
                                    {task.title}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex items-center text-[10px] text-muted-foreground">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {task.dueDate}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[9px] h-4 px-1 uppercase tracking-tighter",
                                            task.priority === 'High' ? "text-rose-500 border-rose-500/20 bg-rose-500/5" :
                                                task.priority === 'Medium' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                                                    "text-slate-500 border-slate-500/20 bg-slate-500/5"
                                        )}
                                    >
                                        {task.priority}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
