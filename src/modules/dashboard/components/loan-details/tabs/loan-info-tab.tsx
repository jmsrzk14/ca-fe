'use client';

import * as React from 'react';
import { Button } from '@/shared/ui/button';

export function LoanInfoTab() {
    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Pinjaman
                </h2>
                <Button variant="outline" size="sm" className="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10">
                    Ubah Pinjaman
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-12">
                <DetailItem label="Peminjam" value="Mesya Angelia Hutagalung (Mesya)" />
                <DetailItem label="Produk" value="UMKM" />
                <DetailItem label="Tanggal Diajukan" value="February 13, 2026 - 9:50 WIB" />
                <DetailItem label="Tanggal Diubah" value="February 13, 2026 - 9:50 WIB" />
                <DetailItem label="Plafon Diajukan" value="Rp50,000,000" />
                <DetailItem label="Jangka Waktu" value="3 Bulan" />
                <DetailItem label="Suku Bunga" value="8.00%" />
                <DetailItem label="Tipe Suku Bunga" value="Flat" />
                <DetailItem label="Angsuran Per Bulan" value="Rp 17,000,000" />
                <DetailItem label="Plafon Max" value="—" />
                <DetailItem label="Tujuan Penggunaan" value="buka toko lele" />
            </div>

            <div className="mb-12">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center mb-6">Rincian Penggunaan</h3>
                <div className="bg-muted rounded-xl p-4 flex justify-between items-center max-w-2xl mx-auto border border-border">
                    <span className="text-sm font-medium text-foreground">buka toko lele</span>
                    <span className="text-sm font-bold text-foreground">50,000,000.00</span>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span className="w-1 h-5 bg-primary rounded-full"></span>
                        Data Tambahan
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <DetailItem label="Asuransi" value="—" />
                    <DetailItem label="Biaya Administrasi" value="—" />
                    <DetailItem label="Biaya Provisi" value="—" />
                    <DetailItem label="Materai" value="—" />
                    <DetailItem label="Tabungan Rutin" value="—" />
                </div>
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
