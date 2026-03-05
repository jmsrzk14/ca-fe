'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Copy,
    Settings,
    Loader2,
    X,
    Plus,
    Pencil,
} from 'lucide-react';
import { applicantService, applicationService } from '@/core/api';
import { useAttributeRegistry } from '@/shared/hooks/use-attribute-registry';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { t } from '@/shared/lib/t';

interface ApplicantDetailProps {
    id: string;
}

const TABS = ['Data Peminjam', 'Daftar Pinjaman'] as const;
type Tab = (typeof TABS)[number];

export function ApplicantDetail({ id }: ApplicantDetailProps) {
    const [activeTab, setActiveTab] = React.useState<Tab>('Data Peminjam');
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

    const groupedAttributes = React.useMemo(() => {
        if (!applicant) return [];

        const groups: Record<string, { label: string; value: string }[]> = {};
        const data = applicant;
        const attributes = data.attributes || [];

        const coreGroup = '1. Identitas';
        groups[coreGroup] = [
            {
                label: getLabel('applicant_type', t`Tipe Applicant`),
                value: data.applicantType ? data.applicantType.charAt(0).toUpperCase() + data.applicantType.slice(1).toLowerCase() : '-',
            },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('company_name', t`Nama Perusahaan`)
                    : getLabel('full_name', t`Nama Lengkap`),
                value: data.fullName,
            },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('nib_number', t`NIB`)
                    : getLabel('identity_number', t`NIK`),
                value: data.identityNumber,
            },
            { label: getLabel('tax_id', t`NPWP`), value: data.taxId || '-' },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('tanggal_pendirian', t`Tanggal Pendirian`)
                    : getLabel('tanggal_lahir', t`Tanggal Lahir`),
                value: data.birthDate
                    ? new Date(data.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '-',
            },
        ];

        attributes.forEach((attr: any) => {
            const config = getAttributeConfig(attr.key || attr.attributeCode);
            const catVal = config?.categoryName || 'Informasi Lainnya';
            const cat = t`${catVal}`;

            if (!groups[cat]) groups[cat] = [];

            groups[cat].push({
                label: t`${config?.uiLabel || attr.key}`,
                value: attr.value,
            });
        });

        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [applicant, getLabel, getAttributeConfig, t]);

    if (isLoading || isRegistryLoading) {
        return <DetailSkeleton />;
    }

    if (error || !applicant) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                    <X className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">{t`Applicant Not Found`}</p>
                <Button asChild variant="outline" size="sm">
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
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2" asChild>
                        <Link href="/borrowers">
                            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                            {t`Kembali`}
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-lg font-bold text-foreground">
                            {data.fullName}
                        </h1>
                        <Badge variant="secondary" className="capitalize">
                            {data.applicantType?.toLowerCase() || '-'}
                        </Badge>
                    </div>
                    <button
                        className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono hover:text-foreground transition-colors"
                        onClick={() => copyToClipboard(data.id)}
                    >
                        <Copy className="h-3 w-3" />
                        {data.id}
                    </button>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href={`/borrowers/${data.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                        {t`Edit Profil`}
                    </Link>
                </Button>
            </div>

            {/* Tabs + Content */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center border-b px-4 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors relative",
                                    activeTab === tab
                                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-5">
                        {activeTab === 'Data Peminjam' && (
                            <BorrowerDataView groupedAttributes={groupedAttributes} />
                        )}
                        {activeTab === 'Daftar Pinjaman' && (
                            <LoansListView
                                isLoading={isAppsLoading}
                                applications={applicationsData?.applications}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/* ── Profile data: 2-column key-value table per category ── */
function BorrowerDataView({ groupedAttributes }: { groupedAttributes: [string, { label: string; value: string }[]][] }) {
    if (groupedAttributes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Settings className="h-6 w-6 mb-3 opacity-20" />
                <p className="text-sm">{t`Belum ada data profil.`}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groupedAttributes.map(([category, items]) => (
                <div key={category}>
                    <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
                        {category.replace(/^\d+\.\s*/, '')}
                    </h3>
                    <div className="rounded-lg border overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0">
                            {/* Left column: even indices */}
                            <div className="flex flex-col divide-y md:border-r">
                                {items.filter((_, i) => i % 2 === 0).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-xs text-muted-foreground">{item.label.replace(/_/g, ' ')}</span>
                                        <span className="text-xs font-medium text-foreground text-right">{item.value || '-'}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Right column: odd indices */}
                            <div className="flex flex-col divide-y">
                                {items.filter((_, i) => i % 2 !== 0).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-xs text-muted-foreground">{item.label.replace(/_/g, ' ')}</span>
                                        <span className="text-xs font-medium text-foreground text-right">{item.value || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Loans list table ── */
function LoansListView({ isLoading, applications }: { isLoading: boolean; applications?: any[] }) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t`Memuat data pinjaman...`}</span>
            </div>
        );
    }

    if (!applications?.length) {
        return (
            <div className="text-center py-8 space-y-2">
                <p className="text-sm text-muted-foreground">{t`Belum ada pinjaman.`}</p>
                <Button size="sm" variant="outline" asChild>
                    <Link href="/loans">
                        <Plus className="h-3.5 w-3.5" />
                        {t`Pengajuan Baru`}
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-lg border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>{t`Jumlah Pinjaman`}</TableHead>
                        <TableHead>{t`Tenor`}</TableHead>
                        <TableHead>{t`Tujuan`}</TableHead>
                        <TableHead>{t`Status`}</TableHead>
                        <TableHead>{t`Tanggal`}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.map((app: any) => (
                        <TableRow key={app.id}>
                            <TableCell>
                                <Link href={`/loans/${app.id}`} className="text-xs font-semibold text-primary hover:underline">
                                    {app.loanAmount
                                        ? `Rp ${Number(app.loanAmount).toLocaleString('id-ID')}`
                                        : '-'}
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {app.tenorMonths ? `${app.tenorMonths} bulan` : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {app.loanPurpose || '-'}
                            </TableCell>
                            <TableCell>
                                <LoanStatusBadge status={app.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {app.createdAt
                                    ? new Date(app.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="space-y-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
    );
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    INTAKE: { label: 'Intake', className: 'bg-slate-100 text-slate-600' },
    SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
    ANALYSIS: { label: 'Analisis', className: 'bg-amber-100 text-amber-700' },
    APPROVED: { label: 'Disetujui', className: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-700' },
    DISBURSED: { label: 'Dicairkan', className: 'bg-purple-100 text-purple-700' },
    CLOSED: { label: 'Selesai', className: 'bg-slate-100 text-slate-600' },
};

function LoanStatusBadge({ status }: { status?: string }) {
    const s = STATUS_MAP[status?.toUpperCase() || ''] || { label: status || '-', className: 'bg-muted text-muted-foreground' };
    return (
        <Badge variant="outline" className={`text-xs font-semibold border ${s.className}`}>
            {s.label}
        </Badge>
    );
}
