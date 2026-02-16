'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { MoreVertical, GripVertical } from 'lucide-react';
import { ApplicationCardData } from '../types/kanban';
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

    const getBorderColor = (status: string) => {
        switch (status) {
            case 'Collect Additional Data': return 'border-t-blue-400';
            case 'Application in Progress': return 'border-t-purple-400';
            case 'Review Required': return 'border-t-rose-400';
            case 'Automated Decisioning': return 'border-t-orange-400';
            case 'Offers Available': return 'border-t-emerald-400';
            default: return 'border-t-slate-400';
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "relative h-[130px] rounded-xl border-2 border-dashed border-primary/20 bg-primary/5",
                    getBorderColor(application.status),
                    "border-t-4"
                )}
            />
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn(
                "group relative overflow-hidden transition-all hover:shadow-lg border-t-4 bg-card/60 backdrop-blur-sm",
                getBorderColor(application.status)
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
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                {application.borrowerName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                                    {application.refNumber}
                                </span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] text-muted-foreground">
                                    {application.date}
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
                        {application.amount > 0 ? `$${application.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$-'}
                    </div>
                    <div className="flex -space-x-2">
                        {application.assignees.map((assignee, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background ring-offset-background">
                                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                    {assignee.name}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
