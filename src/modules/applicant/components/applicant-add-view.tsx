'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { t } from '@/shared/lib/t';
import { DynamicApplicantForm } from './dynamic-applicant-form';
import Link from 'next/link';

export function ApplicantAddView() {
    const router = useRouter();

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">{t`Tambah Peminjam Baru`}</h1>
            </div>

            <DynamicApplicantForm
                onSuccess={() => router.push('/borrowers')}
                onCancel={() => router.back()}
            />
        </div>
    );
}
