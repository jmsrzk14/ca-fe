'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User,
    Loader2,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Building2,
    Settings,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    DollarSign,
    Activity,
    Heart,
    GraduationCap,
    Home,
} from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { applicantService, referenceService } from '@/core/api';
import { ApplicantType, AttributeRegistry } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { DynamicField } from '@/shared/components/dynamic-field';
import { buildDynamicSchema, resolveChoiceId } from '@/shared/lib/dynamic-form';

interface DynamicApplicantFormProps {
    applicantId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const ICON_MAP: Record<string, any> = {
    User, Building2, Settings, CheckCircle2,
    Phone, Mail, MapPin, Briefcase, DollarSign, Activity, Heart,
    GraduationCap, Home,
};

const CATEGORY_ICON_FALLBACK: Record<string, any> = {
    KONTAK: Phone,
    PEKERJAAN: Briefcase,
    FINANSIAL: DollarSign,
    USAHA: DollarSign,
    IDENTITAS: User,
    BIO: User,
    PERILAKU: Activity,
    KARAKTER: Activity,
    PASANGAN: Heart,
    DOKUMEN: Building2,
    PENDIDIKAN: GraduationCap,
    RUMAH: Home,
};

function resolveIcon(iconName?: string, categoryTitle?: string) {
    if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
    if (categoryTitle) {
        const upper = categoryTitle.toUpperCase();
        for (const [keyword, icon] of Object.entries(CATEGORY_ICON_FALLBACK)) {
            if (upper.includes(keyword)) return icon;
        }
    }
    return Settings;
}

const PRIMARY_KEYS = ['fullName', 'identityNumber', 'taxId', 'birthDate', 'establishmentDate', 'applicantType'];

// Schema for the primary (step-0) fields
const primarySchema = z.object({
    fullName: z.string().min(1, 'Nama wajib diisi'),
    identityNumber: z.string().min(1, 'NIK/NIB wajib diisi'),
    taxId: z.string(),
    birthDate: z.string(),
});

export function DynamicApplicantForm({ applicantId, onSuccess, onCancel }: DynamicApplicantFormProps) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    const { data: registryResponse, isLoading: isRegistryLoading } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
    });

    const { data: categoriesResponse, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['attribute-categories'],
        queryFn: () => referenceService.listAttributeCategories(),
    });

    const { data: applicantData, isLoading: isApplicantLoading } = useQuery({
        queryKey: ['applicant', applicantId],
        queryFn: () => applicantService.getById(applicantId!),
        enabled: !!applicantId,
        initialData: () => {
            if (!applicantId) return undefined;
            const cached = queryClient.getQueryData<any>(['applicants']);
            return cached?.applicants?.find((a: any) => a.id === applicantId) ?? undefined;
        },
    });

    const [localType, setLocalType] = React.useState<ApplicantType>('PERSONAL');

    const normalizeApplicantType = (val: string | undefined): ApplicantType => {
        const upper = (val || '').toUpperCase().trim();
        if (upper === 'CORPORATE' || upper === 'COMPANY') return 'CORPORATE';
        return 'PERSONAL';
    };

    const type: ApplicantType = applicantId
        ? normalizeApplicantType(applicantData?.applicantType)
        : localType;
    const setType = (t: ApplicantType) => { if (!applicantId) setLocalType(t); };

    const registry = (registryResponse?.attributes as AttributeRegistry[]) || [];
    const apiCategories = categoriesResponse?.categories || [];

    // Dynamic attributes grouped by category
    const categories = React.useMemo(() => {
        const groups: Record<string, AttributeRegistry[]> = {};

        registry.forEach(attr => {
            if (PRIMARY_KEYS.includes(attr.attributeCode)) return;
            if (attr.scope !== 'APPLICANT') return;
            if (attr.appliesTo !== 'BOTH' && attr.appliesTo !== type) return;
            if (!applicantId && attr.hideOnCreate) return;

            const catCode = attr.categoryCode || 'IDENTITAS';
            if (!groups[catCode]) groups[catCode] = [];
            groups[catCode].push(attr);
        });

        if (apiCategories.length > 0) {
            return apiCategories
                .filter(cat => !!cat)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map(cat => ({
                    id: (cat.categoryCode || '').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                    title: cat.categoryName || 'Lainnya',
                    fields: (groups[cat.categoryCode] || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
                    iconName: cat.uiIcon,
                }))
                .filter(cat => cat.fields.length > 0);
        }

        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, fields]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                title: name || 'Lainnya',
                fields: fields.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
                iconName: undefined as string | undefined,
            }))
            .filter(cat => cat.fields.length > 0);
    }, [registry, apiCategories, type, applicantId]);

    const steps = React.useMemo(() => {
        return categories.map(cat => ({
            ...cat,
            icon: resolveIcon(cat.iconName, cat.title),
        }));
    }, [categories]);

    // Build dynamic Zod schema for each step
    const stepSchemas = React.useMemo(() => {
        return steps.map(step => buildDynamicSchema(step.fields));
    }, [steps]);

    // Form state — use react-hook-form for primary fields
    const primaryForm = useForm<z.infer<typeof primarySchema>>({
        resolver: zodResolver(primarySchema),
        defaultValues: { fullName: '', identityNumber: '', taxId: '', birthDate: '' },
    });

    // Dynamic fields stored separately (flat key-value)
    const [dynamicData, setDynamicData] = React.useState<Record<string, string>>({});
    const [dynamicErrors, setDynamicErrors] = React.useState<Record<string, string>>({});

    const handleDynamicChange = (key: string, value: string) => {
        setDynamicData(prev => ({ ...prev, [key]: value }));
        // Clear error on change
        if (dynamicErrors[key]) {
            setDynamicErrors(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    // Load existing applicant data
    const parseToDateString = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val.split('T')[0];
        if (val.seconds !== undefined) {
            try { return new Date(Number(val.seconds) * 1000).toISOString().split('T')[0]; }
            catch { return ''; }
        }
        try {
            const d = new Date(val);
            return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
        } catch { return ''; }
    };

    React.useEffect(() => {
        if (applicantData) {
            setCurrentStep(0);
            const normalizedType = normalizeApplicantType(applicantData.applicantType);

            primaryForm.reset({
                fullName: applicantData.fullName || '',
                identityNumber: applicantData.identityNumber || '',
                taxId: applicantData.taxId || '',
                birthDate: normalizedType === 'CORPORATE'
                    ? parseToDateString(applicantData.establishmentDate)
                    : parseToDateString(applicantData.birthDate),
            });

            const newDynamic: Record<string, string> = {};
            applicantData.attributes?.forEach((attr: any) => {
                const regItem = registry.find(r => r.id === attr.key || r.attributeCode === attr.key);
                const formKey = regItem ? regItem.attributeCode : attr.key;
                if (formKey && !PRIMARY_KEYS.includes(formKey)) {
                    newDynamic[formKey] = attr.value ?? '';
                }
            });
            setDynamicData(newDynamic);
        }
    }, [applicantData, registry]);

    // Validation
    const validateCurrentStep = (): boolean => {
        if (currentStep === 0) {
            // Trigger primary form validation
            // We'll check synchronously via getValues
            const values = primaryForm.getValues();
            if (!values.fullName?.trim() || !values.identityNumber?.trim()) {
                primaryForm.trigger();
                return false;
            }
            return true;
        }

        // Validate dynamic fields for current step
        const step = steps[currentStep];
        if (!step) return true;

        const schema = stepSchemas[currentStep];
        if (!schema) return true;

        const stepData: Record<string, string> = {};
        for (const field of step.fields) {
            stepData[field.attributeCode] = dynamicData[field.attributeCode] || '';
        }

        const result = schema.safeParse(stepData);
        if (!result.success) {
            const errors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const key = issue.path[0] as string;
                errors[key] = issue.message;
            }
            setDynamicErrors(prev => ({ ...prev, ...errors }));
            const firstError = Object.values(errors)[0];
            toast.error(firstError || 'Harap lengkapi field yang wajib');
            return false;
        }

        return true;
    };

    const nextStep = () => {
        if (!validateCurrentStep()) return;
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (applicantId) return applicantService.update(applicantId, data);
            return applicantService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            if (applicantId) {
                queryClient.invalidateQueries({ queryKey: ['applicant', applicantId] });
            }
            toast.success(applicantId ? t`Peminjam berhasil diperbarui` : t`Peminjam berhasil ditambahkan`);
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.message || (applicantId ? t`Gagal memperbarui peminjam` : t`Gagal menambah peminjam`));
        },
    });

    const performSubmit = () => {
        setIsConfirmOpen(false);
        const now = new Date().toISOString();
        const primary = primaryForm.getValues();

        const attributes = Object.entries(dynamicData)
            .filter(([key, value]) => value !== undefined && value !== '')
            .map(([key, value]) => {
                const regItem = registry.find(r => r.attributeCode === key);
                return {
                    key: regItem?.id || key,
                    value: String(value),
                    dataType: regItem?.dataType || 'STRING',
                    choiceId: regItem ? resolveChoiceId(regItem, String(value)) : undefined,
                    updatedAt: now,
                };
            });

        const payload = {
            applicantType: type,
            fullName: primary.fullName,
            identityNumber: primary.identityNumber,
            taxId: primary.taxId,
            birthDate: type === 'PERSONAL' && primary.birthDate
                ? new Date(primary.birthDate).toISOString()
                : '',
            establishmentDate: type === 'CORPORATE' && primary.birthDate
                ? new Date(primary.birthDate).toISOString()
                : '',
            attributes,
            ...(applicantId ? {} : { createdAt: now }),
        };

        mutation.mutate(payload);
    };

    if (isRegistryLoading || isCategoriesLoading || (applicantId && isApplicantLoading)) {
        return (
            <div className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">{t`Memuat data...`}</span>
            </div>
        );
    }

    const inputClass = 'h-9 rounded-md';

    return (
        <Card>
            <CardContent className="p-0">
                {/* Step Header */}
                <div className="hidden lg:flex border-b overflow-x-auto">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                            <button
                                key={step.id}
                                type="button"
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors relative",
                                    index === currentStep
                                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                        : index < currentStep
                                            ? "text-emerald-600"
                                            : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => index <= currentStep && setCurrentStep(index)}
                            >
                                {index < currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
                                {step.title}
                            </button>
                        );
                    })}
                </div>

                {/* Form Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        {currentStep === 0 && (
                            <>
                                {/* Type Selector */}
                                <div className="col-span-full mb-2">
                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                                        <div>
                                            <p className="text-sm font-semibold">{t`Tipe Peminjam`}</p>
                                            {!!applicantId && <p className="text-xs text-muted-foreground">{t`Tipe tidak dapat diubah`}</p>}
                                        </div>
                                        <div className={cn("flex bg-background p-0.5 rounded-md border", !!applicantId && "opacity-70")}>
                                            <button
                                                type="button"
                                                onClick={() => setType('PERSONAL')}
                                                disabled={!!applicantId}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5",
                                                    type === 'PERSONAL'
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:text-foreground",
                                                    !!applicantId && "cursor-default"
                                                )}
                                            >
                                                <User className="h-3.5 w-3.5" />
                                                {t`Perorangan`}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setType('CORPORATE')}
                                                disabled={!!applicantId}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5",
                                                    type === 'CORPORATE'
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:text-foreground",
                                                    !!applicantId && "cursor-default"
                                                )}
                                            >
                                                <Building2 className="h-3.5 w-3.5" />
                                                {t`Perusahaan`}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 col-span-full md:col-span-2">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        {t`Nama Lengkap`} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        {...primaryForm.register('fullName')}
                                        className={inputClass}
                                        placeholder={t`Masukkan Nama Sesuai Identitas`}
                                    />
                                    {primaryForm.formState.errors.fullName && (
                                        <p className="text-[10px] text-destructive mt-0.5">{primaryForm.formState.errors.fullName.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        {type === 'PERSONAL' ? t`NIK / No. KTP` : t`NIB / No. Izin`} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        {...primaryForm.register('identityNumber')}
                                        className={inputClass}
                                        placeholder="1234567890..."
                                    />
                                    {primaryForm.formState.errors.identityNumber && (
                                        <p className="text-[10px] text-destructive mt-0.5">{primaryForm.formState.errors.identityNumber.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        {t`NPWP (Opsional)`}
                                    </Label>
                                    <Input
                                        {...primaryForm.register('taxId')}
                                        className={inputClass}
                                        placeholder="00.000.000.0-000.000"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        {type === 'PERSONAL' ? t`Tanggal Lahir` : t`Tanggal Pendirian`}
                                    </Label>
                                    <Input
                                        {...primaryForm.register('birthDate')}
                                        type="date"
                                        className={inputClass}
                                    />
                                </div>
                            </>
                        )}

                        {currentStep > 0 && steps[currentStep]?.fields?.map((field: AttributeRegistry) => (
                            <DynamicField
                                key={field.attributeCode}
                                field={field}
                                value={dynamicData[field.attributeCode] || ''}
                                onChange={handleDynamicChange}
                                error={dynamicErrors[field.attributeCode]}
                                inputClass={inputClass}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={currentStep === 0 ? onCancel : () => setCurrentStep(prev => prev - 1)}>
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                        {currentStep === 0 ? t`Batal` : t`Kembali`}
                    </Button>

                    <Button
                        size="sm"
                        onClick={currentStep === steps.length - 1 ? () => {
                            if (validateCurrentStep()) setIsConfirmOpen(true);
                        } : nextStep}
                        className={currentStep === steps.length - 1 ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                        {currentStep === steps.length - 1 ? t`Simpan Peminjam` : t`Langkah Berikutnya`}
                        {currentStep < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 ml-1" />}
                    </Button>
                </div>
            </CardContent>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Konfirmasi Simpan`}</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setIsConfirmOpen(false)}>{t`Batal`}</Button>
                        <Button size="sm" onClick={performSubmit} disabled={mutation.isPending}>{t`Ya, Simpan`}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
