'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { MoreVertical, GripVertical, Building2, Clock } from 'lucide-react';
import { ApplicationCardData, APPLICATION_STATUS_COLUMNS } from '../types/kanban';
import { cn } from '@/shared/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ApplicationCardProps {
    application: ApplicationCardData;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: application.id,
        data: {
            type: 'Application',
            application
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const colMeta = APPLICATION_STATUS_COLUMNS.find(c => c.id === application.status);
    const borderColor = colMeta?.color ?? 'border-t-slate-400';

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "relative h-[130px] rounded-xl border-2 border-dashed border-primary/20 bg-primary/5",
                    borderColor,
                    "border-t-4"
                )}
            />
        );
    }

    const amountFormatted = application.amount > 0
        ? `Rp ${application.amount.toLocaleString('id-ID')}`
        : 'Rp -';

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn(
                "group relative overflow-hidden transition-all hover:shadow-lg border-t-4 bg-card/60 backdrop-blur-sm",
                borderColor
            )}
        >
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                        <div
                            {...listeners}
                            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors group-hover:opacity-100 opacity-0"
                        >
                            <GripVertical className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mb-0.5">
                                {application.fullName || 'Guest'}
                            </div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors font-mono">
                                #{application.refNumber}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground font-medium">
                                    {application.branchCode || '—'}
                                </span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">
                                    {application.tenorMonths} bln
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div className="text-lg font-bold tracking-tight text-gradient">
                        {amountFormatted}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                        {application.date}
                    </div>
                </div>

                {application.loanPurpose && (
                    <p className="mt-2 text-[10px] text-muted-foreground truncate">
                        {application.loanPurpose}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
