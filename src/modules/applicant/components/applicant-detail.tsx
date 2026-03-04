'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    User,
    Building2,
    Fingerprint,
    Edit3,
    X,
    Copy,
    Link as LinkIcon,
    Activity,
    Calendar,
    Settings,
    Banknote,
    Clock,
    FileText,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import { applicantService, applicationService } from '@/core/api';
import { useAttributeRegistry } from '@/shared/hooks/use-attribute-registry';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Skeleton } from '@/shared/ui/skeleton';
import Link from 'next/link';
import { toast } from 'sonner';
import { t } from '@/shared/lib/t';

interface ApplicantDetailProps {
    id: string;
}

export function ApplicantDetail({ id }: ApplicantDetailProps) {
    const { getLabel, getAttributeConfig, isLoading: isRegistryLoading } = useAttributeRegistry();

    const { data: applicant, isLoading, error } = useQuery({
        queryKey: ['applicant', id],
        queryFn: () => applicantService.getById(id),
    });

    const { data: applicationsData, isLoading: isAppsLoading } = useQuery({
        queryKey: ['applications', { applicantId: id }],
        queryFn: () => applicationService.list({ applicantId: id }),
        enabled: !!id,
    });

    // Grouping logic: Merge registry info with actual values (MUST be before early returns)
    const groupedAttributes = React.useMemo(() => {
        if (!applicant) return [];

        const groups: Record<string, any[]> = {};
        const data = applicant;
        const attributes = data.attributes || [];

        // 1. Initial Core Group (Category 1 usually)
        const coreGroup = '1. Identitas';
        groups[coreGroup] = [
            {
                label: getLabel('applicant_type', t`Tipe Applicant`),
                value: data.applicantType ? data.applicantType.charAt(0).toUpperCase() + data.applicantType.slice(1).toLowerCase() : '-',
                icon: Building2
            },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('company_name', t`Nama Perusahaan`)
                    : getLabel('full_name', t`Nama Lengkap`),
                value: data.fullName,
                icon: User
            },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('nib_number', t`NIB`)
                    : getLabel('identity_number', t`NIK`),
                value: data.identityNumber,
                icon: Fingerprint
            },
            { label: getLabel('tax_id', t`NPWP`), value: data.taxId || '-', icon: Activity },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('tanggal_pendirian', t`Tanggal Pendirian`)
                    : getLabel('tanggal_lahir', t`Tanggal Lahir`),
                value: data.applicantType === 'COMPANY'
                    ? (data.birthDate ? new Date(data.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-')
                    : (data.birthDate ? new Date(data.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'),
                icon: Calendar
            },
        ];

        // 2. Map Dynamic attributes to their categories
        attributes.forEach((attr: any) => {
            const config = getAttributeConfig(attr.key || attr.attributeCode);
            const catVal = config?.categoryName || 'Informasi Lainnya';
            const cat = t`${catVal}`;

            if (!groups[cat]) groups[cat] = [];

            groups[cat].push({
                label: t`${config?.uiLabel || attr.key}`,
                value: attr.value,
                icon: Settings
            });
        });

        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [applicant, getLabel, getAttributeConfig, t]);

    if (isLoading || isRegistryLoading) {
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
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline" className="rounded-xl hover:bg-orange-500/10 hover:text-orange-500 font-bold border-orange-500/20 text-orange-600">
                                <Link href={`/borrowers/${data.id}/edit`}>
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    {t`Edit Profil`}
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full">
                                <Link href="/borrowers">
                                    <X className="h-6 w-6" />
                                </Link>
                            </Button>
                        </div>
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

                {/* Navigation Tabs — outer (Profile / Pinjaman) */}
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
                            className="bg-transparent p-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-base font-bold transition-all text-muted-foreground/60 hover:text-muted-foreground capitalize"
                        >
                            {t`Daftar Pinjaman`}
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab — inner tabs per category */}
                    <TabsContent value="profile" className="pt-6">
                        {groupedAttributes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Settings className="h-10 w-10 mb-4 opacity-20" />
                                <p className="font-medium text-lg">{t`Belum ada data profil.`}</p>
                            </div>
                        ) : (
                            <Tabs defaultValue={groupedAttributes[0]?.[0]}>
                                {/* Horizontal header tabs */}
                                <TabsList className="bg-transparent h-auto p-0 gap-5 border-b border-border w-full justify-start rounded-none mb-6 overflow-x-auto flex-nowrap">
                                    {groupedAttributes.map(([category]) => (
                                        <TabsTrigger
                                            key={category}
                                            value={category}
                                            style={{ whiteSpace: 'normal', maxWidth: '120px' }}
                                            className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-600 text-sm font-semibold transition-all text-muted-foreground hover:text-foreground text-center leading-snug"
                                        >
                                            {category.replace(/^\d+\.\s*/, '')}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {/* Content panels */}
                                {groupedAttributes.map(([category, items]) => (
                                    <TabsContent
                                        key={category}
                                        value={category}
                                        className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
                                            {items.map((item, idx) => (
                                                <DetailRow key={idx} label={item.label} value={item.value || '-'} />
                                            ))}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        )}
                    </TabsContent>

                    <TabsContent value="applications" className="pt-6">
                        {isAppsLoading ? (
                            <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">{t`Memuat data pinjaman...`}</span>
                            </div>
                        ) : !applicationsData?.applications?.length ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border py-12">
                                <LinkIcon className="h-10 w-10 mb-4 opacity-20" />
                                <p className="font-medium text-lg">{t`Belum ada pinjaman.`}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {applicationsData.applications.map((app: any) => (
                                    <Link
                                        key={app.id}
                                        href={`/loans/${app.id}`}
                                        className="group flex items-center gap-5 rounded-2xl border border-border bg-card px-6 py-5 hover:border-orange-300 hover:bg-orange-50/30 transition-all shadow-sm"
                                    >
                                        {/* Icon */}
                                        <div className="h-11 w-11 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                                            {/* Loan amount */}
                                            <div className="flex items-center gap-2">
                                                <Banknote className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span className="text-base font-bold text-foreground">
                                                    {app.loanAmount
                                                        ? `Rp ${Number(app.loanAmount).toLocaleString('id-ID')}`
                                                        : '-'}
                                                </span>
                                            </div>
                                            {/* Tenor & purpose */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4 shrink-0" />
                                                <span>{app.tenorMonths ? `${app.tenorMonths} bulan` : '-'}</span>
                                                {app.loanPurpose && (
                                                    <span className="truncate">· {app.loanPurpose}</span>
                                                )}
                                            </div>
                                            {/* Date */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4 shrink-0" />
                                                <span>
                                                    {app.createdAt
                                                        ? new Date(app.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : '-'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status badge */}
                                        <LoanStatusBadge status={app.status} />

                                        {/* Arrow */}
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function DetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
    const formattedLabel = label.replace(/_/g, ' ');
    return (
        <div className="flex items-start border-b border-border pb-5 justify-between gap-4">
            <span className="text-sm text-muted-foreground font-semibold uppercase tracking-tight w-48 break-words leading-tight pt-1">{formattedLabel}</span>
            <span className={`text-base font-bold flex-1 text-right md:text-left break-words pt-0.5 ${isLink ? 'text-cyan-600 hover:text-cyan-500 cursor-pointer transition-colors' : 'text-foreground'}`}>
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

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    INTAKE: { label: 'Intake', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    ANALYSIS: { label: 'Analisis', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    APPROVED: { label: 'Disetujui', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-200' },
    DISBURSED: { label: 'Dicairkan', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    CLOSED: { label: 'Selesai', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function LoanStatusBadge({ status }: { status?: string }) {
    const s = STATUS_MAP[status?.toUpperCase() || ''] || { label: status || '-', className: 'bg-muted text-muted-foreground border-border' };
    return (
        <Badge variant="outline" className={`text-xs font-bold px-3 py-1 rounded-full border ${s.className}`}>
            {s.label}
        </Badge>
    );
}
