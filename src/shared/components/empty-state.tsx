import * as React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    title,
    description,
    icon,
    className,
    action,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/5 p-12 text-center animate-in fade-in duration-500",
            className
        )}>
            <div className="mb-4 rounded-full bg-muted/20 p-4 text-muted-foreground">
                {icon || <PackageOpen className="h-10 w-10" />}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
