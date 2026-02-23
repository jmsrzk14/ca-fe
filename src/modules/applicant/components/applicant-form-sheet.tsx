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
import { ApplicantForm } from './applicant-form';

interface ApplicantFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicantFormSheet({ open, onOpenChange }: ApplicantFormSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] p-0 overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/50">
                <div className="flex flex-col h-full">
                    <SheetHeader className="p-8 border-b border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <SheetTitle className="text-2xl font-bold tracking-tight">{t`Add Borrower`}</SheetTitle>
                                <SheetDescription className="mt-2">
                                    {t`Fill in the details below to register a new borrower in the system.`}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 p-8">
                        <ApplicantForm
                            onSuccess={() => onOpenChange(false)}
                            onCancel={() => onOpenChange(false)}
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
