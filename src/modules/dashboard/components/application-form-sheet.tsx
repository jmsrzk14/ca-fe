'use client';

import * as React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/shared/lib/utils';
import { User, Building2, MapPin, Mail, Phone, Calendar, Fingerprint, ChevronRight, Loader2, CheckCircle2, Settings, IdCard, Users, ShieldCheck, Briefcase, Store, GraduationCap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referenceService, applicationService, applicantService } from '@/core/api';
import { toast } from 'sonner';
import { t } from '@/shared/lib/t';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

const ICON_MAP: Record<string, React.ElementType> = {
    'id-card': IdCard,
    'users': Users,
    'map-pin': MapPin,
    'home': Mail,
    'graduation-cap': GraduationCap,
    'briefcase': Briefcase,
    'store': Store,
    'shield-check': ShieldCheck,
    'default': Settings
};

interface ApplicationFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicationFormSheet({ open, onOpenChange }: ApplicationFormSheetProps) {
    const queryClient = useQueryClient();
    const [step, setStep] = React.useState(1);
    const [type, setType] = React.useState<'PERSONAL' | 'CORPORATE'>('PERSONAL');
    const [formData, setFormData] = React.useState<Record<string, any>>({});

    const { data: registry, isLoading: isRegistryLoading } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
        enabled: open,
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            // 1. Create Applicant
            const applicantResponse = await applicantService.create(payload.applicant);

            // 2. Create Application
            const applicationPayload = {
                ...payload.application,
                applicantId: applicantResponse.id
            };
            return applicationService.create(applicationPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            toast.success(t`Pengajuan berhasil dibuat`);
            onOpenChange(false);
            setStep(1);
            setFormData({});
        },
        onError: (error: any) => {
            toast.error(error.message || t`Gagal membuat pengajuan`);
        }
    });

    const applicantAttributes = React.useMemo(() => {
        if (!registry?.attributes) return [];
        return registry.attributes.filter((attr: any) =>
            (attr.appliesTo === 'BOTH' || attr.appliesTo === type) &&
            attr.scope === 'APPLICANT'
        ).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [registry, type]);

    const applicationAttributes = React.useMemo(() => {
        if (!registry?.attributes) return [];
        return registry.attributes.filter((attr: any) =>
            attr.scope === 'APPLICATION'
        ).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [registry]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (s: number) => {
        const attrs = s === 1 ? applicantAttributes : applicationAttributes;
        const missingFields = attrs
            .filter(attr => attr.isRequired && (!formData[attr.attributeCode] || formData[attr.attributeCode] === ''))
            .map(attr => attr.uiLabel || attr.description);

        if (missingFields.length > 0) {
            toast.error(t`Harap isi kolom: ${missingFields.join(', ')}`);
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateStep(2)) return;

        // Map Applicant Fields
        const APPLICANT_TOP_MAPPING: Record<string, string> = {
            'full_name': 'fullName',
            'identity_number': 'identityNumber',
            'tax_id': 'taxId',
            'tanggal_lahir': 'birthDate',
            'establishment_date': 'establishmentDate'
        };

        const applicantPayload: any = { applicantType: type, attributes: [] };
        applicantAttributes.forEach(attr => {
            const val = formData[attr.attributeCode];
            if (val === undefined || val === '') return;

            const topField = APPLICANT_TOP_MAPPING[attr.attributeCode];
            if (topField) {
                applicantPayload[topField] = String(val);
            } else {
                applicantPayload.attributes.push({
                    key: attr.attributeCode,
                    value: String(val),
                    dataType: attr.dataType
                });
            }
        });

        // Map Application Fields
        const APP_TOP_MAPPING: Record<string, string> = {
            'loan_amount': 'loanAmount',
            'tenor_months': 'tenorMonths',
            'loan_purpose': 'loanPurpose',
            'interest_rate': 'interestRate',
            'interest_type': 'interestType'
        };

        const applicationPayload: any = { attributes: [] };
        applicationAttributes.forEach(attr => {
            const val = formData[attr.attributeCode];
            if (val === undefined || val === '') return;

            const topField = APP_TOP_MAPPING[attr.attributeCode];
            if (topField) {
                if (topField === 'tenorMonths') applicationPayload[topField] = parseInt(String(val));
                else applicationPayload[topField] = String(val);
            } else {
                applicationPayload.attributes.push({
                    attributeId: attr.attributeCode,
                    value: String(val),
                    dataType: attr.dataType
                });
            }
        });

        // Default mandatory fields if missing
        applicationPayload.productId = applicationPayload.productId || "prod-1";
        applicationPayload.aoId = applicationPayload.aoId || "ao-1";
        applicationPayload.branchCode = applicationPayload.branchCode || "JKT01";

        mutation.mutate({
            applicant: applicantPayload,
            application: applicationPayload
        });
    };

    const renderField = (attr: any) => {
        const { attributeCode, uiLabel, description, dataType, isRequired, options } = attr;
        const labelText = uiLabel || description;

        return (
            <div key={attributeCode} className="space-y-3">
                <Label htmlFor={attributeCode} className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {labelText} {isRequired && <span className="text-rose-500">*</span>}
                </Label>
                {dataType === 'SELECT' ? (
                    <Select
                        onValueChange={(v) => handleSelectChange(attributeCode, v)}
                        value={formData[attributeCode]}
                    >
                        <SelectTrigger className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all rounded-xl px-5 text-sm">
                            <SelectValue placeholder={t`Pilih ${labelText}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options?.map((opt: any) => (
                                <SelectItem key={opt.id} value={opt.optionValue}>
                                    {opt.optionLabel}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : dataType === 'BOOLEAN' ? (
                    <Select
                        onValueChange={(v) => handleSelectChange(attributeCode, v)}
                        value={formData[attributeCode]}
                    >
                        <SelectTrigger className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all rounded-xl px-5 text-sm">
                            <SelectValue placeholder={t`Pilih Jawaban`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">{t`Ya`}</SelectItem>
                            <SelectItem value="false">{t`Tidak`}</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="relative group">
                        <Input
                            id={attributeCode}
                            name={attributeCode}
                            type={dataType === 'DATE' ? 'date' : dataType === 'NUMBER' ? 'number' : 'text'}
                            placeholder={t`Masukkan ${labelText}`}
                            value={formData[attributeCode] || ''}
                            onChange={handleInputChange}
                            className="h-12 bg-muted/10 border-border/50 focus:bg-background transition-all rounded-xl px-5 text-sm"
                        />
                        {dataType === 'DATE' && <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="sm:max-w-[1100px] w-[90vw] p-0 bg-background border-r border-border overflow-hidden flex flex-col h-full gap-0">
                <div className="flex flex-col h-full">
                    <div className="p-10 border-b border-border/50 bg-muted/5">
                        <SheetHeader className="p-0">
                            <div className="flex flex-col gap-1">
                                <SheetTitle className="text-4xl font-bold tracking-tight text-foreground">
                                    Form Pengajuan
                                </SheetTitle>
                                <p className="text-sm text-muted-foreground font-medium">Personal Loan</p>
                            </div>
                        </SheetHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 pt-8 pb-32">
                        {isRegistryLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="text-muted-foreground font-bold">{t`Memuat Detail Formulir...`}</p>
                            </div>
                        ) : step === 1 ? (
                            <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex items-center justify-between border-b border-border/20 pb-6">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-2xl font-bold text-foreground">Borrower Profile</h3>
                                        <p className="text-sm text-muted-foreground">Please provide the borrower's basic information</p>
                                    </div>
                                    <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-[240px]">
                                        <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1.5 rounded-xl border border-border/50">
                                            <TabsTrigger value="PERSONAL" className="rounded-lg text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-9">
                                                Person
                                            </TabsTrigger>
                                            <TabsTrigger value="CORPORATE" className="rounded-lg text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-9">
                                                Company
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">Informasi Dasar</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                        {applicantAttributes.map(renderField)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex flex-col gap-1 border-b border-border/20 pb-6">
                                    <h3 className="text-2xl font-bold text-foreground">Application Details</h3>
                                    <p className="text-sm text-muted-foreground">Detail pinjaman dan informasi tambahan</p>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">Rincian Pinjaman</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                        {applicationAttributes.map(renderField)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-10 border-t border-border/50 flex items-center justify-between bg-muted/2 backdrop-blur-md">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setStep(1)}>
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition-all shadow-xl",
                                    step === 1 ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground opacity-50"
                                )}>
                                    1
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        step === 1 ? "text-primary" : "text-muted-foreground opacity-50"
                                    )}>
                                        Step 01
                                    </span>
                                    <span className={cn(
                                        "text-sm font-bold leading-none mt-1",
                                        step === 1 ? "text-foreground" : "text-muted-foreground opacity-50"
                                    )}>
                                        Borrower Profile
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => (step === 1 && validateStep(1)) ? setStep(2) : null}>
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition-all shadow-xl",
                                    step === 2 ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground opacity-50"
                                )}>
                                    2
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        step === 2 ? "text-primary" : "text-muted-foreground opacity-50"
                                    )}>
                                        Step 02
                                    </span>
                                    <span className={cn(
                                        "text-sm font-bold leading-none mt-1",
                                        step === 2 ? "text-foreground" : "text-muted-foreground opacity-50"
                                    )}>
                                        Application Details
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground hover:bg-transparent h-12"
                            >
                                Cancel
                            </Button>
                            {step === 1 ? (
                                <Button
                                    onClick={() => validateStep(1) && setStep(2)}
                                    className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
                                >
                                    Next Step
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={mutation.isPending}
                                    className="h-14 px-12 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-2xl shadow-green-600/30 transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
                                >
                                    {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                    {t`Buat Pengajuan`}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
