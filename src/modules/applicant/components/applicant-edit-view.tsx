'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { t } from '@/shared/lib/t';
import { DynamicApplicantForm } from './dynamic-applicant-form';
import Link from 'next/link';

interface ApplicantEditViewProps {
    id: string;
}

export function ApplicantEditView({ id }: ApplicantEditViewProps) {
    const router = useRouter();

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2" asChild>
                    <Link href={`/borrowers/${id}`}>
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        {t`Kembali`}
                    </Link>
                </Button>
                <h1 className="text-lg font-bold text-foreground">{t`Edit Peminjam`}</h1>
            </div>

            <DynamicApplicantForm
                applicantId={id}
                onSuccess={() => router.push(`/borrowers/${id}`)}
                onCancel={() => router.back()}
            />
        </div>
    );
}
