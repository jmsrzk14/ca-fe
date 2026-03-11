'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyService } from '@/core/api/services/survey-service';
import { referenceService } from '@/core/api/services/reference-service';
import { applicationService } from '@/core/api/services/application-service';
import { applicantService } from '@/core/api/services/applicant-service';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import {
    ClipboardList,
    Search,
    CheckCircle2,
    Loader2,
    Info,
    Package,
    Check
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface SurveyAssignModalProps {
    applicationId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function SurveyAssignModal({ applicationId, isOpen, onClose }: SurveyAssignModalProps) {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedTemplateIds, setSelectedTemplateIds] = React.useState<string[]>([]);
    
    // Step state and form data
    const [step, setStep] = React.useState<1 | 2>(1);
    const [formData, setFormData] = React.useState({
        surveyType: '',
        assignedTo: '',
        surveyPurpose: ''
    });
    
    // reset selection when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setSelectedTemplateIds([]);
            setSearchQuery('');
            setStep(1);
            setFormData({
                surveyType: '',
                assignedTo: '',
                surveyPurpose: ''
            });
        }
    }, [isOpen]);

    // 1. Fetch Application to get applicantId
    const { data: appData, isLoading: isLoadingApp } = useQuery({
        queryKey: ['application', applicationId],
        queryFn: () => applicationService.getById(applicationId),
        enabled: isOpen && !!applicationId,
    });

    // auto-fill assignedTo with aoId when appData is loaded
    React.useEffect(() => {
        if ((appData as any)?.aoId) {
            setFormData(prev => ({
                ...prev,
                assignedTo: (appData as any).aoId
            }));
        }
    }, [(appData as any)?.aoId]);

    // 2. Fetch Applicant to get applicantType
    const { data: applicantData, isLoading: isLoadingApplicant } = useQuery({
        queryKey: ['applicant', appData?.applicantId],
        queryFn: () => applicantService.getById(appData?.applicantId!),
        enabled: isOpen && !!appData?.applicantId,
    });

    // 3. Fetch Templates
    const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
        queryKey: ['survey-templates'],
        queryFn: () => surveyService.getTemplates(),
        enabled: isOpen,
    });

    // 4. Fetch Products for mapping
    const { data: productsData } = useQuery({
        queryKey: ['loan-products'],
        queryFn: () => referenceService.getLoanProducts(),
        enabled: isOpen,
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
                const payload = {
                    applicationId,
                    templateId,
                    surveyType: formData.surveyType,
                    assignedTo: formData.assignedTo,
                    surveyPurpose: formData.surveyPurpose
                };
                
                // Log payload to console
                console.log('Assign Survey Payload:', payload);
                
                await surveyService.assignSurvey(applicationId, {
                    templateId,
                    surveyType: formData.surveyType,
                    assignedTo: formData.assignedTo,
                    surveyPurpose: formData.surveyPurpose
                });
            }
        },
        onSuccess: () => {
            toast.success(`${selectedTemplateIds.length} survey berhasil ditugaskan`);
            queryClient.invalidateQueries({ queryKey: ['surveys', applicationId] });
            onClose();
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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                        Assign Survey
                    </DialogTitle>
                    <DialogDescription>
                        Pilih template survey yang akan ditugaskan untuk pengajuan ini.
                    </DialogDescription>
                </DialogHeader>

                {isDataLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground animate-pulse">Memuat data...</p>
                    </div>
                ) : (
                    <div className="space-y-6 mt-4 relative">
                        {step === 1 ? (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10 h-12 bg-card border-border/50 focus:border-primary/50 text-sm rounded-xl"
                                        placeholder="Cari template survey..."
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
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
                                                                {template.applicantType || 'GENERAL'}
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
                            </>
                        ) : (
                            <div className="space-y-6 pb-24 animate-in slide-in-from-right-4">
                                <Card className="border-border/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg">Detail Penugasan Survey</CardTitle>
                                        <CardDescription>
                                            Lengkapi detail penugasan untuk {selectedTemplateIds.length} template yang dipilih.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="surveyType" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipe Survey</Label>
                                            <Select 
                                                value={formData.surveyType} 
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, surveyType: value }))}
                                            >
                                                <SelectTrigger id="surveyType" className="h-12 rounded-xl">
                                                    <SelectValue placeholder="Pilih Tipe Survey" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FIELD">FIELD</SelectItem>
                                                    <SelectItem value="DESK">DESK</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>



                                        <div className="space-y-2">
                                            <Label htmlFor="surveyPurpose" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tujuan Survey</Label>
                                            <Select 
                                                value={formData.surveyPurpose} 
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, surveyPurpose: value }))}
                                            >
                                                <SelectTrigger id="surveyPurpose" className="h-12 rounded-xl">
                                                    <SelectValue placeholder="Pilih Tujuan Survey" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GENERAL">GENERAL</SelectItem>
                                                    <SelectItem value="COLLATERAL">COLLATERAL</SelectItem>
                                                    <SelectItem value="MANAGEMENT">MANAGEMENT</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                        
                        {selectedTemplateIds.length > 0 && (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-3xl bg-slate-900 flex-col sm:flex-row text-white rounded-2xl p-4 shadow-xl flex items-center justify-between border border-white/10 z-10">
                                <div className="flex flex-col pl-2 mb-3 sm:mb-0">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terpilih</span>
                                    <span className="text-sm font-black text-white">{selectedTemplateIds.length} Template</span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    {step === 2 && (
                                        <Button
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStep(1);
                                            }}
                                            className="rounded-xl px-4 h-10 w-full sm:w-auto text-xs font-bold tracking-wider text-slate-300 border-white/20 hover:bg-white/10"
                                        >
                                            Kembali
                                        </Button>
                                    )}
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (step === 1) {
                                                setStep(2);
                                            } else {
                                                if (!formData.surveyType || !formData.surveyPurpose) {
                                                    toast.error('Mohon lengkapi semua field form');
                                                    return;
                                                }
                                                assignMutation.mutate(selectedTemplateIds);
                                            }
                                        }}
                                        disabled={assignMutation.isPending}
                                        className="rounded-xl px-6 h-10 w-full sm:w-auto text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg"
                                    >
                                        {assignMutation.isPending ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                                Memproses...
                                            </>
                                        ) : step === 1 ? (
                                            <>
                                                Lanjutkan
                                            </>
                                        ) : (
                                            <>
                                                Assign Sekarang
                                                <CheckCircle2 className="h-3 w-3 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
