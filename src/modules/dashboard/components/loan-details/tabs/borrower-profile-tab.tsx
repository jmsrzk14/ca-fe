'use client';

import * as React from 'react';

export function BorrowerProfileTab() {
    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Profil Peminjam
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <DetailItem label="Nama Lengkap" value="Mesya Angelia Hutagalung" />
                <DetailItem label="NIK" value="3174092837482934" />
                <DetailItem label="Tempat, Tgl Lahir" value="Jakarta, 12 April 1992" />
                <DetailItem label="Jenis Kelamin" value="Perempuan" />
                <DetailItem label="Alamat" value="Jl. Melati No. 45, Tebet, Jakarta Selatan" />
                <DetailItem label="Pekerjaan" value="Wirausaha" />
                <DetailItem label="No. Telepon" value="0812-3456-7890" />
                <DetailItem label="Email" value="mesya.angelia@gmail.com" />
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
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
