'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAttributeRegistry } from '@/shared/hooks/use-attribute-registry';
import { referenceService } from '@/core/api';
import { DetailItem } from '@/shared/components/detail-item';

interface LoanInfoTabProps {
    application?: any;
    applicant?: any;
    productName?: string | null;
}

export function LoanInfoTab({ application, applicant, productName }: LoanInfoTabProps) {
    const { registry, isLoading } = useAttributeRegistry();
    const { data: citiesResponse } = useQuery({
        queryKey: ['cities'],
        queryFn: () => referenceService.listCities(),
        staleTime: 1000 * 60 * 60,
    });
    const citiesMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        (citiesResponse?.cities || []).forEach((c: any) => { map[c.code] = c.value; });
        return map;
    }, [citiesResponse]);

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
        if (attr.dataType === 'SELECT') {
            if (['kota_ktp', 'kota_domisili'].includes(attr.attributeCode)) {
                return citiesMap[val] || val;
            }
            if (attr.choices) {
                const choice = attr.choices.find((opt: any) => opt.code === val);
                return choice?.value || val;
            }
        }
        if (attr.dataType === 'NUMBER') return val;

        return val;
    };

    const loanFields = [
        { label: 'Peminjam', value: (applicant?.fullName || applicant?.attributes?.find((a: any) => a.key === 'full_name' || a.key === '0195383f-4281-7000-bb34-812010000002')?.value) || '—' },
        { label: 'Produk', value: productName || application.productId || '—' },
        { label: 'Tanggal Diajukan', value: formatDate(application.createdAt) },
        { label: 'Tanggal Diubah', value: formatDate(application.updatedAt || application.createdAt) },
        { label: 'Plafon Diajukan', value: formatCurrency(application.loanAmount) },
        { label: 'Jangka Waktu', value: application.tenorMonths ? `${application.tenorMonths} Bulan` : '—' },
        { label: 'Suku Bunga', value: application.interestRate ? `${application.interestRate}%` : '—' },
        { label: 'Tipe Suku Bunga', value: application.interestType || '—' },
        { label: 'Angsuran Per Bulan', value: '—' },
        { label: 'Plafon Max', value: '—' },
        { label: 'Tujuan Penggunaan', value: application.loanPurpose || '—' },
    ];

    const extraFields = applicationAttributes.map((attr: any) => ({
        label: attr.uiLabel || attr.description,
        value: getAttrValue(attr),
    }));

    const allFields = [...loanFields, ...extraFields];

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Informasi Pinjaman
                </h2>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 text-sm">
                    <div className="flex flex-col divide-y divide-border/50 md:border-r border-border/50">
                        {allFields.filter((_, i) => i % 2 === 0).map((field, idx) => (
                            <DetailItem
                                key={idx}
                                label={field.label}
                                value={field.value}
                                variant="inline"
                            />
                        ))}
                    </div>
                    <div className="flex flex-col divide-y divide-border/50">
                        {allFields.filter((_, i) => i % 2 !== 0).map((field, idx) => (
                            <DetailItem
                                key={idx}
                                label={field.label}
                                value={field.value}
                                variant="inline"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
