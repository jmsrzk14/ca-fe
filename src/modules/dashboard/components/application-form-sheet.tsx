'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

interface ApplicationFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicationFormSheet({ open, onOpenChange }: ApplicationFormSheetProps) {
    const router = useRouter();

    React.useEffect(() => {
        if (open) {
            onOpenChange(false);
            router.push('/loans/add');
        }
    }, [open, onOpenChange, router]);

    return null;
}
