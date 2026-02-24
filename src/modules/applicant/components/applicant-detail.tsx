'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    User,
    Building2,
    Fingerprint,
    Mail,
    Phone,
    Edit3,
    X,
    Copy,
    Smartphone,
    Link as LinkIcon,
    Activity,
    Calendar,
    Settings,
} from 'lucide-react';
import { applicantService, referenceService } from '@/core/api';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Skeleton } from '@/shared/ui/skeleton';
import { Separator } from '@/shared/ui/separator';
import Link from 'next/link';
import { toast } from 'sonner';
import { t } from '@/shared/lib/t';

interface ApplicantDetailProps {
    id: string;
}

export function ApplicantDetail({ id }: ApplicantDetailProps) {
    const { data: applicant, isLoading, error } = useQuery({
        queryKey: ['applicant', id],
        queryFn: () => applicantService.getById(id),
    });

    const { data: registryResponse } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
    });

    const registry = (registryResponse?.attributes || []) as any[];

    // Grouping logic: Merge registry info with actual values (MUST be before early returns)
    const groupedAttributes = React.useMemo(() => {
        if (!applicant) return [];

        const groups: Record<string, any[]> = {};
        const data = applicant;
        const attributes = data.attributes || [];

        // 1. Initial Core Group (Category 1 usually)
        const coreGroup = '1. Identitas';
        groups[coreGroup] = [
            { label: t`Tipe Applicant`, value: data.applicantType, icon: Building2 },
            { label: t`Nama Lengkap`, value: data.fullName, icon: User },
            { label: t`NIK / No. Identitas`, value: data.identityNumber, icon: Fingerprint },
            { label: t`NPWP`, value: data.taxId || '-', icon: Activity },
            {
                label: data.applicantType === 'PERSONAL' ? t`Tanggal Lahir` : t`Tanggal Pendirian`,
                value: data.applicantType === 'PERSONAL' ? data.birthDate : data.establishmentDate,
                icon: Calendar
            },
        ];

        // 2. Map Dynamic attributes to their categories
        attributes.forEach((attr: any) => {
            const regItem = registry.find(r => r.attrKey === attr.key);
            const catVal = regItem?.category || 'Informasi Lainnya';
            const cat = t`${catVal}`;

            if (!groups[cat]) groups[cat] = [];

            groups[cat].push({
                label: t`${regItem?.uiLabel || regItem?.attrName || attr.key}`,
                value: attr.value,
                icon: regItem?.uiIcon ? Settings : Settings
            });
        });

        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [applicant, registry, t]);

    if (isLoading) {
        return <DetailSkeleton />;
    }

    if (error || !applicant) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="p-4 bg-destructive/10 text-destructive rounded-full">
                    <X className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold">{t`Applicant Not Found`}</h2>
                <p className="text-muted-foreground">{t`The applicant you are looking for does not exist or has been removed.`}</p>
                <Button asChild variant="outline">
                    <Link href="/borrowers">{t`Go Back to List`}</Link>
                </Button>
            </div>
        );
    }

    const data = applicant;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t`ID copied to clipboard`);
    };

    return (
        <div className="bg-background min-h-screen text-foreground animate-in fade-in duration-500">
            {/* Main Header */}
            <div className="max-w-[1200px] mx-auto px-8 pt-12 pb-4">
                <div className="flex items-start justify-between gap-8">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-6">
                            <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
                                {data.fullName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-16">
                        <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full">
                            <Link href="/borrowers">
                                <X className="h-6 w-6" />
                            </Link>
                        </Button>
                        <div
                            className="bg-muted/50 border border-border rounded-lg px-4 py-1.5 flex items-center gap-3 cursor-pointer hover:bg-muted transition-all group shadow-sm"
                            onClick={() => copyToClipboard(data.id)}
                        >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-orange-600 transition-colors" />
                            <code className="text-xs text-muted-foreground font-mono">
                                {data.id}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <Tabs defaultValue="profile" className="mt-12">
                    <TabsList className="bg-transparent h-auto p-0 gap-10 border-b border-border w-full justify-start rounded-none">
                        <TabsTrigger
                            value="profile"
                            className="bg-transparent p-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-base font-bold transition-all"
                        >
                            {t`Profile Lengkap`}
                        </TabsTrigger>
                        <TabsTrigger
                            value="applications"
                            className="bg-transparent p-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-base font-bold transition-all text-muted-foreground/60 hover:text-muted-foreground"
                        >
                            {t`Daftar Pinjaman`}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="pt-10 space-y-12">
                        {groupedAttributes.map(([category, items]) => (
                            <div key={category} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 border-b-2 border-orange-100 pb-2 w-fit pr-8">
                                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                    {category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4">
                                    {items.map((item, idx) => (
                                        <DetailRow key={idx} label={item.label} value={item.value || '-'} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="applications">
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border py-12">
                            <LinkIcon className="h-10 w-10 mb-4 opacity-20" />
                            <p className="font-medium text-lg">{t`No applications found.`}</p>
                            <Button variant="link" className="text-orange-600 font-bold mt-2">{t`Create New Application`}</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function DetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
    return (
        <div className="flex items-center border-b border-border pb-5 justify-between gap-4">
            <span className="text-sm text-muted-foreground font-semibold uppercase tracking-tight w-48">{label}</span>
            <span className={`text-base font-bold flex-1 text-right md:text-left ${isLink ? 'text-cyan-600 hover:text-cyan-500 cursor-pointer transition-colors' : 'text-foreground'}`}>
                {value}
            </span>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="p-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    );
}
