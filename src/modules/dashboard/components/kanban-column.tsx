'use client';

import * as React from 'react';
import { KanbanColumnData } from '../types/kanban';
import { ApplicationCard } from './application-card';
import { cn } from '@/shared/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
    column: KanbanColumnData;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column
        }
    });

    const applicationIds = React.useMemo(() => {
        return column.applications.map(app => app.id);
    }, [column.applications]);

    return (
        <div className="flex flex-col gap-4 w-full min-w-[300px]">
            <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                        {column.title}
                    </h3>
                    <span className="text-xs font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
                        {column.count}
                    </span>
                </div>
                <div className="text-xs font-bold text-muted-foreground/50 tabular-nums">
                    ${column.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex flex-col gap-3 p-3 rounded-2xl bg-muted/20 min-h-[600px] border border-transparent transition-all hover:bg-muted/30",
                    column.applications.length === 0 && "items-center justify-center border-dashed border-border/50"
                )}
            >
                <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
                    {column.applications.length > 0 ? (
                        column.applications.map((app) => (
                            <ApplicationCard key={app.id} application={app} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-20">
                            <ApplicationCard
                                application={{
                                    id: 'placeholder',
                                    applicantId: '',
                                    borrowerName: '',
                                    productId: '',
                                    aoId: '',
                                    refNumber: '',
                                    date: '',
                                    amount: 0,
                                    tenorMonths: 0,
                                    branchCode: '',
                                    status: column.id as any,
                                    loanPurpose: ''
                                }}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Empty Stage</span>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
