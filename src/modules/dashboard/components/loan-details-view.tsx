'use client';

import * as React from 'react';
import {
    ArrowLeft,
    Loader2,
    Pencil,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { applicationService } from '@/core/api/services/application-service';
import { applicantService } from '@/core/api/services/applicant-service';
import { referenceService } from '@/core/api/services/reference-service';
import { t } from '@/shared/lib/t';

import { LoanInfoTab } from './loan-details/tabs/loan-info-tab';
import { DebtHistoryTab } from './loan-details/tabs/debt-history-tab';
import { DocumentCompletenessTab } from './loan-details/tabs/document-completeness-tab';
import { FinancialInfoTab } from './loan-details/tabs/financial-info-tab';
import { CRRTab } from './loan-details/tabs/crr-tab';
import { HistoryTab } from './loan-details/tabs/history-tab';
import { SurveyTab } from './loan-details/tabs/survey-tab';
import Link from 'next/link';

const TABS = [
    t`Pinjaman`,
    t`Riwayat Hutang`,
    t`Kelengkapan Dokumen`,
    t`Finansial`,
    t`CRR`,
    t`Survey`,
    t`Histori`
];

interface LoanDetailsViewProps {
    id?: string;
}

const STATUS_VARIANT: Record<string, string> = {
    APPROVED: 'bg-emerald-100 text-emerald-700',
    DECLINED: 'bg-red-100 text-red-700',
    PENDING: 'bg-amber-100 text-amber-700',
};

export function LoanDetailsView({ id: propId }: LoanDetailsViewProps) {
    const [activeTab, setActiveTab] = React.useState(TABS[0]);
    const [application, setApplication] = React.useState<any>(null);
    const [applicant, setApplicant] = React.useState<any>(null);
    const [productName, setProductName] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const id = propId || params?.id as string;

    React.useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const appData = await applicationService.getById(id);
                if (appData) {
                    setApplication(appData);
                    if (appData.applicantId) {
                        const applicantData = await applicantService.getById(appData.applicantId);
                        setApplicant(applicantData);
                    }
                    if (appData.productId) {
                        try {
                            const product = await referenceService.getLoanProduct(appData.productId);
                            if (product) setProductName(product.productName);
                        } catch {
                            setProductName(appData.productId);
                        }
                    }
                } else {
                    setError(t`Application not found`);
                }
            } catch {
                setError(t`Failed to load loan details`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="py-8 text-center text-sm text-destructive">
                    {error}
                </div>
            );
        }

        if (activeTab === TABS[0]) return <LoanInfoTab application={application} applicant={applicant} productName={productName} />;
        if (activeTab === TABS[1]) return <DebtHistoryTab />;
        if (activeTab === TABS[2]) return <DocumentCompletenessTab />;
        if (activeTab === TABS[3]) return <FinancialInfoTab />;
        if (activeTab === TABS[4]) return <CRRTab />;
        if (activeTab === TABS[5]) return <SurveyTab applicationId={id} />;
        if (activeTab === TABS[6]) return <HistoryTab />;
        
        return <LoanInfoTab application={application} applicant={applicant} />;
    };

    if (loading && !application) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-32 w-full bg-muted rounded-xl" />
                <div className="h-[400px] w-full bg-muted rounded-xl" />
            </div>
        );
    }

    const statusKey = application?.status?.toUpperCase() || 'PENDING';
    const statusColor = STATUS_VARIANT[statusKey] || STATUS_VARIANT.PENDING;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2" asChild>
                        <Link href="/loans">
                            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                            {t`Kembali`}
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-lg font-bold text-foreground">
                            {applicant?.applicantName || application?.applicantName || t`Peminjaman`}
                        </h1>
                        <Badge variant="outline" className={cn("text-xs font-bold border", statusColor)}>
                            {application?.status || 'Pending'}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {application?.createdAt
                            ? t`Diajukan ${new Date(application.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                            : ''}
                    </p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href={`/loans/${id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                        {t`Edit`}
                    </Link>
                </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                            {t`Informasi Pengajuan`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Field label={t`Tanggal Pengajuan`} value={
                            application?.createdAt
                                ? new Date(application.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                : '-'
                        } />
                        <Field label={t`Produk`} value={productName || '-'} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                            Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Field label={t`Status Pengajuan`} value={application?.status || 'Pending'} />
                        <Field label={t`Diubah Oleh`} value={application?.updatedBy || '-'} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                                {t`Peminjam`}
                            </CardTitle>
                            {applicant?.id && (
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-primary" asChild>
                                    <Link href={`/borrowers/${applicant.id}`}>
                                        {t`Lihat Detail`}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Field label={t`Nama`} value={applicant?.applicantName || applicant?.fullName || '-'} />
                        <Field label={t`NIK`} value={applicant?.identityNumber || '-'} />
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Content */}
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
                        {renderTabContent()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}
