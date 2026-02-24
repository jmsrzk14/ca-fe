'use client';

import * as React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/shared/ui/sheet';
import { t } from '@/shared/lib/t';
import { DynamicApplicantForm } from './dynamic-applicant-form';

interface ApplicantFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicantFormSheet({ open, onOpenChange }: ApplicantFormSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[700px] p-0 border-l border-border/50 bg-background">
                <div className="flex flex-col h-full">
                    <div className="flex-1">
                        <DynamicApplicantForm
                            onSuccess={() => onOpenChange(false)}
                            onCancel={() => onOpenChange(false)}
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
