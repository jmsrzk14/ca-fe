'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyService } from '@/core/api/services/survey-service';
import { referenceService } from '@/core/api/services/reference-service';
import { applicationService } from '@/core/api/services/application-service';
import { applicantService } from '@/core/api/services/applicant-service';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
    ArrowLeft,
    ClipboardList,
    Search,
    CheckCircle2,
    Plus,
    Loader2,
    AlertCircle,
    Info,
    Package,
    Check,
    Square
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

export function SurveyAssignPage() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params.id as string;
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedTemplateIds, setSelectedTemplateIds] = React.useState<string[]>([]);

    // 1. Fetch Application to get applicantId
    const { data: appData, isLoading: isLoadingApp } = useQuery({
        queryKey: ['application', applicationId],
        queryFn: () => applicationService.getById(applicationId),
        enabled: !!applicationId,
    });

    // 2. Fetch Applicant to get applicantType
    const { data: applicantData, isLoading: isLoadingApplicant } = useQuery({
        queryKey: ['applicant', appData?.applicantId],
        queryFn: () => applicantService.getById(appData?.applicantId!),
        enabled: !!appData?.applicantId,
    });

    // 3. Fetch Templates
    const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
        queryKey: ['survey-templates'],
        queryFn: () => surveyService.getTemplates(),
    });

    // 4. Fetch Products for mapping
    const { data: productsData } = useQuery({
        queryKey: ['loan-products'],
        queryFn: () => referenceService.getLoanProducts(),
    });

    const productMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        (productsData as any)?.products?.forEach((p: any) => {
            map[p.id] = p.productName;
        });
        return map;
    }, [productsData]);

    const assignMutation = useMutation({
        mutationFn: async (templateIds: string[]) => {
            // Assign each template sequentially
            for (const templateId of templateIds) {
                await surveyService.assignSurvey(applicationId, {
                    templateId,
                    surveyType: 'GENERAL',
                    assignedTo: '',
                    surveyPurpose: 'GENERAL'
                });
            }
        },
        onSuccess: () => {
            toast.success(`${selectedTemplateIds.length} survey berhasil ditugaskan`);
            queryClient.invalidateQueries({ queryKey: ['surveys', applicationId] });
            router.push(`/loans/${applicationId}`);
        },
        onError: (err: any) => {
            toast.error('Gagal menugaskan survey: ' + (err.message || 'Terjadi kesalahan'));
        }
    });

    const toggleTemplate = (id: string) => {
        setSelectedTemplateIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const templates = (templatesData as any)?.templates || [];

    // Filter by applicant type if available
    const filteredByApplicantType = React.useMemo(() => {
        if (!applicantData?.applicantType) return templates;

        return templates.filter((t: any) => {
            const templateType = t.applicantType?.toUpperCase();
            const targetType = applicantData.applicantType.toUpperCase();

            // Allow if match or if template is GENERAL
            return templateType === targetType || templateType === 'GENERAL' || !templateType;
        });
    }, [templates, applicantData?.applicantType]);

    const filteredTemplates = filteredByApplicantType.filter((t: any) =>
        t.templateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.templateCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isDataLoading = isLoadingTemplates || isLoadingApp || isLoadingApplicant;

    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-2 w-fit"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Kembali ke Detail Pinjaman
                    </button>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Plus className="h-6 w-6" />
                        </div>
                        Assign Survey Baru
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-10 h-12 bg-card border-border/50 focus:border-primary/50 text-sm rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {filteredTemplates.length === 0 ? (
                    <div className="bg-muted/30 rounded-3xl border border-dashed border-border p-20 flex flex-col items-center justify-center text-center gap-4">
                        <Info className="h-10 w-10 text-muted-foreground/30" />
                        <div>
                            <p className="text-sm font-bold text-foreground">Tidak ada template ditemukan</p>
                            <p className="text-xs text-muted-foreground mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTemplates.map((template: any) => {
                            const isSelected = selectedTemplateIds.includes(template.id);

                            return (
                                <Card
                                    key={template.id}
                                    onClick={() => toggleTemplate(template.id)}
                                    className={cn(
                                        "overflow-hidden border-border/50 hover:border-primary/50 transition-all group hover:shadow-md rounded-2xl cursor-pointer relative",
                                        isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-4 right-4 h-6 w-6 rounded-lg border flex items-center justify-center transition-all",
                                        isSelected ? "bg-primary border-primary text-white" : "bg-white border-slate-200 group-hover:border-primary/50"
                                    )}>
                                        {isSelected ? <Check className="h-4 w-4" /> : null}
                                    </div>

                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                isSelected ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
                                            )}>
                                                <ClipboardList className="h-5 w-5" />
                                            </div>
                                                            <Badge variant="secondary" className="mr-8 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                                                {template.applicantType || 'ALL'}
                                                            </Badge>
                                                        </div>
                                                        <CardTitle className={cn(
                                                            "text-base font-bold mt-4 leading-snug transition-colors",
                                                            isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                                                        )}>
                                                            {template.templateName || 'Template Survey'}
                                                        </CardTitle>
                                                        <CardDescription className="font-mono text-[10px] uppercase tracking-widest mt-1">
                                                            CODE: {template.templateCode}
                                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Produk</span>
                                            <div className="flex items-center gap-1.5">
                                                <Package className="h-3 w-3 text-primary" />
                                                <span className="text-xs font-semibold text-foreground">
                                                    {productMap[template.productId] || template.productId || 'Semua Produk'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action Bar */}
            {selectedTemplateIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md bg-opacity-90">
                        <div className="flex flex-col pl-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terpilih</span>
                            <span className="text-lg font-black text-white">{selectedTemplateIds.length} Template</span>
                        </div>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                assignMutation.mutate(selectedTemplateIds);
                            }}
                            disabled={assignMutation.isPending}
                            className="rounded-full px-8 h-12 text-sm font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg border-2 border-white/10"
                        >
                            {assignMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    Assign Sekarang
                                    <CheckCircle2 className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
