'use client';

import * as React from 'react';
import { useAttributeRegistry } from '@/shared/hooks/use-attribute-registry';
import { DetailItem } from '@/shared/components/detail-item';

interface BorrowerProfileTabProps {
    applicant?: any;
}

export function BorrowerProfileTab({ applicant }: BorrowerProfileTabProps) {
    const { registry, isLoading } = useAttributeRegistry();

    if (isLoading) {
        return <div className="p-8 text-center animate-pulse text-muted-foreground">Memuat data...</div>;
    }

    if (!applicant) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Data peminjam tidak ditemukan.
            </div>
        );
    }

    let type = applicant.applicantType || 'PERSONAL';
    if (type === 'COMPANY') type = 'CORPORATE';

    // Filter attributes for this profile
    const profileAttributes = registry.filter((attr: any) =>
        (attr.appliesTo === 'BOTH' || attr.appliesTo === type) &&
        attr.scope === 'APPLICANT'
    ).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const formatDate = (dateStr?: string) => {
        if (!dateStr || dateStr === '—') return '—';
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

    const getValue = (attr: any) => {
        const attrCode = attr.attributeCode;

        // Check top-level fields first (with mapping)
        const TOP_LEVEL_MAPPING: Record<string, string> = {
            'full_name': 'fullName',
            'identity_number': 'identityNumber',
            'tax_id': 'taxId',
            'tanggal_lahir': 'birthDate',
            'establishment_date': 'establishmentDate'
        };

        const topLevelField = TOP_LEVEL_MAPPING[attrCode];
        let val = '—';

        if (topLevelField && applicant[topLevelField]) {
            val = applicant[topLevelField];
        } else {
            // Find in attributes by key (which could be UUID or attributeCode)
            const extraAttr = applicant.attributes?.find((a: any) =>
                a.key === attrCode || a.key === attr.id
            );
            if (extraAttr) val = extraAttr.value;
        }

        if (!val || val === '' || val === '—') return '—';

        // Format based on type
        if (attr.dataType === 'DATE') return formatDate(val);
        if (attr.dataType === 'BOOLEAN') return val === 'true' || val === 'Y' || val === '1' ? 'Ya' : 'Tidak';
        if (attr.dataType === 'SELECT' && attr.options) {
            const option = attr.options.find((opt: any) => opt.optionValue === val);
            return option?.optionLabel || val;
        }

        return val;
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
                    {/* Split attributes into two columns */}
                    <div className="flex flex-col divide-y divide-border/50 md:border-r border-border/50">
                        {profileAttributes.filter((_, i) => i % 2 === 0).map(attr => (
                            <DetailItem
                                key={attr.id}
                                label={attr.uiLabel || attr.description}
                                value={getValue(attr)}
                                variant="inline"
                            />
                        ))}
                    </div>
                    <div className="flex flex-col divide-y divide-border/50">
                        {profileAttributes.filter((_, i) => i % 2 !== 0).map(attr => (
                            <DetailItem
                                key={attr.id}
                                label={attr.uiLabel || attr.description}
                                value={getValue(attr)}
                                variant="inline"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
