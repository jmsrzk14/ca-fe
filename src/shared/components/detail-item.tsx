import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface DetailItemProps {
    label: string;
    value: React.ReactNode;
    variant?: 'row' | 'inline';
}

export function DetailItem({ label, value, variant = 'row' }: DetailItemProps) {
    if (variant === 'inline') {
        return (
            <div className="flex px-4 py-3 hover:bg-muted/5 transition-colors">
                <span className="text-xs font-bold text-foreground w-[160px] shrink-0 pt-0.5">
                    {label}
                </span>
                <span className="text-xs font-medium text-muted-foreground flex-1 break-words">
                    {value}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between group">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors w-1/3">
                {label}
            </span>
            <span className="text-sm font-medium text-foreground flex-1">
                {value}
            </span>
        </div>
    );
}
