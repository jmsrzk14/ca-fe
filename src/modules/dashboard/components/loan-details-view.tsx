'use client';

import * as React from 'react';
import {
    Plus,
    RotateCw,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { applicationService } from '@/core/api/services/application-service';
import { applicantService } from '@/core/api/services/applicant-service';
import { referenceService } from '@/core/api/services/reference-service';

// Import Tabs
import { BorrowerProfileTab } from './loan-details/tabs/borrower-profile-tab';
import { LoanInfoTab } from './loan-details/tabs/loan-info-tab';
import { DebtHistoryTab } from './loan-details/tabs/debt-history-tab';
import { DocumentCompletenessTab } from './loan-details/tabs/document-completeness-tab';
import { FinancialInfoTab } from './loan-details/tabs/financial-info-tab';
import { CRRTab } from './loan-details/tabs/crr-tab';
import { HistoryTab } from './loan-details/tabs/history-tab';

const TABS = [
    'Profil Peminjam',
    'Pinjaman',
    'Riwayat Hutang',
    'Kelengkapan Dokumen',
    'Finansial',
    'CRR',
    'Histori'
];

interface LoanDetailsViewProps {
    id?: string;
}

export function LoanDetailsView({ id: propId }: LoanDetailsViewProps) {
    const [activeTab, setActiveTab] = React.useState('Profil Peminjam');
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
                        } catch (pErr) {
                            setProductName(appData.productId); // Fallback to ID
                        }
                    }
                } else {
                    setError('Application not found');
                }
            } catch (err) {
                setError('Failed to load loan details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-8 text-center text-destructive font-medium">
                    {error}
                </div>
            );
        }

        switch (activeTab) {
            case 'Profil Peminjam':
                return (
                    <div className="flex flex-col gap-12">
                        <BorrowerProfileTab applicant={applicant} />
                    </div>
                );
            case 'Pinjaman': return <LoanInfoTab application={application} applicant={applicant} productName={productName} />;
            case 'Riwayat Hutang': return <DebtHistoryTab />;
            case 'Kelengkapan Dokumen': return <DocumentCompletenessTab />;
            case 'Finansial': return <FinancialInfoTab />;
            case 'CRR': return <CRRTab />;
            case 'Histori': return <HistoryTab />;
            default: return <LoanInfoTab application={application} applicant={applicant} />;
        }
    };

    if (loading && !application) {
        return (
            <div className="flex flex-col gap-6 animate-pulse p-4">
                <div className="h-40 w-full bg-muted rounded-2xl" />
                <div className="grid grid-cols-4 gap-4">
                    <div className="h-10 bg-muted rounded-lg" />
                    <div className="h-10 bg-muted rounded-lg" />
                    <div className="h-10 bg-muted rounded-lg" />
                    <div className="h-10 bg-muted rounded-lg" />
                </div>
                <div className="h-[500px] w-full bg-muted rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Actions */}
            <div className="flex items-center justify-between px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-muted-foreground hover:text-foreground gap-2 font-bold uppercase text-[10px] tracking-widest group"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Kembali Ke Daftar
                </Button>
            </div>

            {/* Top Header Card */}
            <Card className="border border-border/50 shadow-sm overflow-hidden bg-card rounded-2xl mb-8">
                <CardContent className="p-0">
                    <div className="p-6 border-b border-border/50 ">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Peminjaman Kredit: <span className="text-foreground">{productName || application?.productId || 'UMKM'}</span>
                        </h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/50 ">
                        <div className="flex items-center gap-4 px-8 py-5">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">Diajukan</span>
                                <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">
                                    {application?.createdAt ? new Date(application.createdAt).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    }) + ` - ${new Date(application.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB` : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 px-8 py-5">
                            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                                <RotateCw className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">Status</span>
                                <div className="mt-0.5">
                                    <Badge className={cn(
                                        "hover:bg-opacity-80 text-white border-0 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-none cursor-default uppercase",
                                        application?.status === 'APPROVED' ? 'bg-emerald-500' :
                                            application?.status === 'DECLINED' ? 'bg-rose-500' : 'bg-orange-500'
                                    )}>
                                        {application?.status || 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Card */}
            <Card className="border-border shadow-sm min-h-[600px] bg-card">
                <CardContent className="p-0">
                    {/* Tabs */}
                    <div className="flex items-center border-b border-border px-6 overflow-x-auto no-scrollbar bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-4 text-xs font-semibold whitespace-nowrap transition-all relative",
                                    activeTab === tab
                                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {renderTabContent()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
