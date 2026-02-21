'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { t } from '@lingui/macro';
import { ApplicantForm } from './applicant-form';

export function ApplicantAddView() {
    const router = useRouter();

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-6">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="group -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        {t`Kembali`}
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <UserPlus className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t`Tambah Peminjam Baru`}</h1>
                    </div>
                </div>
            </div>

            <ApplicantForm
                onSuccess={() => router.push('/borrowers')}
                onCancel={() => router.back()}
            />
        </div>
    );
}
