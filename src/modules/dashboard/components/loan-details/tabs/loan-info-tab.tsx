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
    const { registry, getLabel, isLoading } = useAttributeRegistry();

    if (isLoading) {
        return <div className="p-8 text-center animate-pulse text-muted-foreground">Memuat data...</div>;
    }

    if (!application) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Data pinjaman tidak ditemukan.
            </div>
        );
    }

    // Filter attributes for application scope
    const applicationAttributes = registry.filter((attr: any) =>
        attr.scope === 'APPLICATION'
    ).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const formatCurrency = (amount?: string | number) => {
        if (amount === undefined || amount === null || amount === '') return '—';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr || dateStr === '—') return '—';
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

    const getAttrValue = (attr: any) => {
        const extraAttr = application.attributes?.find((a: any) => a.attributeId === attr.attributeCode || a.attributeId === attr.id);
        if (!extraAttr) return '—';

        const val = extraAttr.value;
        if (!val || val === '' || val === '—') return '—';

        if (attr.dataType === 'DATE') return formatDate(val);
        if (attr.dataType === 'BOOLEAN') return val === 'true' || val === 'Y' || val === '1' ? 'Ya' : 'Tidak';
        if (attr.dataType === 'SELECT' && attr.options) {
            const option = attr.options.find((opt: any) => opt.optionValue === val);
            return option?.optionLabel || val;
        }
        if (attr.dataType === 'NUMBER') return val;

        return val;
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
                <DetailItem label="Peminjam" value={(applicant?.fullName || applicant?.attributes?.find((a: any) => a.key === 'full_name' || a.key === '0195383f-4281-7000-bb34-812010000002')?.value) || '—'} />
                <DetailItem label="Produk" value={productName || application.productId || '—'} />
                <DetailItem label="Tanggal Diajukan" value={formatDate(application.createdAt)} />
                <DetailItem label="Tanggal Diubah" value={formatDate(application.updatedAt || application.createdAt)} />
                <DetailItem label="Plafon Diajukan" value={formatCurrency(application.loanAmount)} />
                <DetailItem label="Jangka Waktu" value={application.tenorMonths ? `${application.tenorMonths} Bulan` : '—'} />
                <DetailItem label="Suku Bunga" value={application.interestRate ? `${application.interestRate}%` : '—'} />
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

            {applicationAttributes.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span className="w-1 h-5 bg-primary rounded-full"></span>
                            Data Tambahan
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        {applicationAttributes.map((attr: any) => (
                            <DetailItem
                                key={attr.id}
                                label={attr.uiLabel || attr.description}
                                value={getAttrValue(attr)}
                            />
                        ))}
                    </div>
                </div>
            )}
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
