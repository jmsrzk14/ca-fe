'use client';

import * as React from 'react';

interface BorrowerProfileTabProps {
    applicant?: any;
}

export function BorrowerProfileTab({ applicant }: BorrowerProfileTabProps) {
    if (!applicant) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Data peminjam tidak ditemukan.
            </div>
        );
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Profil Peminjam
                </h2>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 text-sm">
                    {/* Left Column */}
                    <div className="flex flex-col divide-y divide-border/50 md:border-r border-border/50">
                        <DetailItem label="Nama Lengkap" value={applicant.fullName || '—'} />
                        <DetailItem label="NIK" value={applicant.identityNumber || '—'} />
                        <DetailItem label="Tempat Lahir" value={applicant.birthPlace || '—'} />
                        <DetailItem label="Jenis Kelamin" value={applicant.gender || '—'} />
                    </div>
                    {/* Right Column */}
                    <div className="flex flex-col divide-y divide-border/50">
                        <DetailItem label="Email" value={applicant.email || '—'} />
                        <DetailItem label="NPWP" value={applicant.taxId || '—'} />
                        <DetailItem label="Tanggal Lahir" value={formatDate(applicant.birthDate)} />
                        <DetailItem label="Nomor Telepon" value={applicant.phoneNumber || '—'} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex px-6 py-4 hover:bg-muted/5 transition-colors">
            <span className="text-xs font-bold text-foreground w-[160px] shrink-0 pt-0.5">
                {label}
            </span>
            <span className="text-xs font-medium text-muted-foreground flex-1 break-words">
                {value}
            </span>
        </div>
    );
}
