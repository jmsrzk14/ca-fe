'use client';

import * as React from 'react';
import { Button } from '@/shared/ui/button';
import { useAttributeRegistry } from '@/shared/hooks/use-attribute-registry';

interface LoanInfoTabProps {
    application?: any;
    applicant?: any;
    productName?: string | null;
}

export function LoanInfoTab({ application, applicant, productName }: LoanInfoTabProps) {
    const { getLabel } = useAttributeRegistry();

    if (!application) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Data pinjaman tidak ditemukan.
            </div>
        );
    }

    const formatCurrency = (amount?: string | number) => {
        if (amount === undefined || amount === null) return '—';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }) + ` - ${new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
        } catch {
            return dateStr;
        }
    };

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
                <DetailItem label="Peminjam" value={applicant?.fullName || '—'} />
                <DetailItem label="Produk" value={productName || application.productId || '—'} />
                <DetailItem label="Tanggal Diajukan" value={formatDate(application.createdAt)} />
                <DetailItem label="Tanggal Diubah" value={formatDate(application.updatedAt || application.createdAt)} />
                <DetailItem label="Plafon Diajukan" value={formatCurrency(application.loanAmount)} />
                <DetailItem label="Jangka Waktu" value={`${application.tenorMonths || 0} Bulan`} />
                <DetailItem label="Suku Bunga" value={`${application.interestRate || 0}%`} />
                <DetailItem label="Tipe Suku Bunga" value={application.interestType || '—'} />
                <DetailItem label="Angsuran Per Bulan" value="—" />
                <DetailItem label="Plafon Max" value="—" />
                <DetailItem label="Tujuan Penggunaan" value={application.loanPurpose || '—'} />
            </div>

            <div className="mb-12">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center mb-6">Rincian Penggunaan</h3>
                <div className="bg-muted rounded-xl p-4 flex justify-between items-center max-w-2xl mx-auto border border-border">
                    <span className="text-sm font-medium text-foreground">{application.loanPurpose || '—'}</span>
                    <span className="text-sm font-bold text-foreground">{formatCurrency(application.loanAmount).replace('Rp', '')}</span>
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
                    {application.attributes?.map((attr: any) => (
                        <DetailItem key={attr.attributeId} label={getLabel(attr.attributeId)} value={attr.value || '—'} />
                    )) || (
                            <>
                                <DetailItem label="Asuransi" value="—" />
                                <DetailItem label="Biaya Administrasi" value="—" />
                                <DetailItem label="Biaya Provisi" value="—" />
                                <DetailItem label="Materai" value="—" />
                                <DetailItem label="Tabungan Rutin" value="—" />
                            </>
                        )}
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
