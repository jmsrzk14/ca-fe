'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    User,
    Save,
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
    Calendar,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';

interface DynamicApplicantFormProps {
    applicantId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const getIconWithName = (name?: string) => {
    if (!name) return Settings;
    try {
        const icons: Record<string, any> = {
            User, Building2, Settings, CheckCircle2,
            Phone, Mail, MapPin, Briefcase, DollarSign, Activity, Heart,
            GraduationCap, Home
        };
        return icons[name] || Settings;
    } catch {
        return Settings;
    }
};

const getCommonOptions = (): Record<string, { label: string; value: string; }[]> => ({
    gender: [
        { label: t`Laki-laki`, value: 'MALE' },
        { label: t`Perempuan`, value: 'FEMALE' },
    ],
    maritalStatus: [
        { label: t`Belum Menikah`, value: 'SINGLE' },
        { label: t`Menikah`, value: 'MARRIED' },
        { label: t`Cerai`, value: 'DIVORCED' },
    ],
    homeOwnership: [
        { label: t`Milik Sendiri`, value: 'OWNED' },
        { label: t`Sewa/Kontrak`, value: 'RENTED' },
        { label: t`Milik Keluarga`, value: 'FAMILY' },
    ],
    jobStatus: [
        { label: t`Karyawan Tetap`, value: 'PERMANENT' },
        { label: t`Karyawan Kontrak`, value: 'CONTRACT' },
        { label: t`Wiraswasta`, value: 'SELF_EMPLOYED' },
    ],
    lastEducation: [
        { label: t`SMA/Sederajat`, value: 'SMA' },
        { label: t`D3`, value: 'D3' },
        { label: t`S1`, value: 'S1' },
        { label: t`S2`, value: 'S2' },
    ],
    isKnownInArea: [
        { label: t`Ya`, value: 'YES' },
        { label: t`Tidak`, value: 'NO' },
    ]
});

export function DynamicApplicantForm({ applicantId, onSuccess, onCancel }: DynamicApplicantFormProps) {
    const COMMON_OPTIONS = React.useMemo(() => getCommonOptions(), []);
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
            const found = cached?.applicants?.find((a: any) => a.id === applicantId);
            return found ?? undefined;
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

    const [formData, setFormData] = React.useState<Record<string, any>>({
        fullName: '',
        identityNumber: '',
        taxId: '',
        birthDate: '',
        establishmentDate: '',
    });

    const parseToDateString = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val.split('T')[0];
        if (val.seconds !== undefined) {
            try {
                return new Date(Number(val.seconds) * 1000).toISOString().split('T')[0];
            } catch { return ''; }
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

            const newFormData: Record<string, any> = {
                fullName: applicantData.fullName || '',
                identityNumber: applicantData.identityNumber || '',
                taxId: applicantData.taxId || '',
                birthDate: normalizedType === 'CORPORATE'
                    ? parseToDateString(applicantData.establishmentDate)
                    : parseToDateString(applicantData.birthDate),
            };

            applicantData.attributes?.forEach((attr: any) => {
                const regItem = registry.find(r => r.id === attr.key || r.attributeCode === attr.key);
                const formKey = regItem ? regItem.attributeCode : attr.key;
                if (formKey) newFormData[formKey] = attr.value ?? '';
            });

            setFormData(newFormData);
        }
    }, [applicantData, registry]);

    const categories = React.useMemo(() => {
        const groups: Record<string, AttributeRegistry[]> = {};
        const primaryKeys = ['fullName', 'identityNumber', 'taxId', 'birthDate', 'establishmentDate', 'applicantType'];

        registry.forEach(attr => {
            if (primaryKeys.includes(attr.attributeCode)) return;
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
                    fields: groups[cat.categoryCode] || [],
                    iconName: cat.uiIcon
                }));
        }

        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, fields]) => ({
                id: (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                title: t`${name || 'Lainnya'}`,
                fields,
                iconName: undefined
            }));
    }, [registry, apiCategories, t, type]);

    const steps = React.useMemo(() => {
        return categories.map(cat => {
            let Icon = Settings;
            const name = cat.title.toUpperCase();

            if (cat.iconName) {
                Icon = getIconWithName(cat.iconName);
            } else {
                if (name.includes('KONTAK')) Icon = Phone;
                if (name.includes('PEKERJAAN')) Icon = Briefcase;
                if (name.includes('FINANSIAL') || name.includes('USAHA')) Icon = DollarSign;
                if (name.includes('IDENTITAS') || name.includes('BIO')) Icon = User;
                if (name.includes('PERILAKU') || name.includes('KARAKTER')) Icon = Activity;
                if (name.includes('PASANGAN')) Icon = Heart;
                if (name.includes('DOKUMEN')) Icon = Building2;
                if (name.includes('PENDIDIKAN')) Icon = GraduationCap;
                if (name.includes('RUMAH')) Icon = Home;
            }

            return { ...cat, icon: Icon };
        });
    }, [categories]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (applicantId) {
                return applicantService.update(applicantId, data);
            }
            return applicantService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            if (applicantId) {
                queryClient.invalidateQueries({ queryKey: ['applicant', applicantId] });
            }
            toast.success(applicantId ? t`Applicant updated successfully` : t`Applicant created successfully`);
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.message || (applicantId ? t`Failed to update applicant` : t`Failed to create applicant`));
        },
    });

    const nextStep = () => {
        if (currentStep === 0) {
            if (!formData.fullName || !formData.identityNumber) {
                toast.error(t`Harap isi Nama dan NIK/NIB`);
                return;
            }
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const performSubmit = () => {
        setIsConfirmOpen(false);
        const now = new Date().toISOString();

        const primaryKeys = [
            'applicantType', 'identityNumber', 'taxId', 'fullName',
            'birthDate', 'establishmentDate', 'attributes', 'createdAt'
        ];

        const attributes = Object.entries(formData)
            .filter(([key, value]) => !primaryKeys.includes(key) && value !== undefined && value !== '')
            .map(([key, value]) => {
                const regItem = registry.find(r => r.attributeCode === key);
                return {
                    key: regItem?.id || key,
                    value: String(value),
                    dataType: regItem?.dataType || 'STRING',
                    updatedAt: now
                };
            });

        const payload = {
            applicantType: type,
            fullName: formData.fullName,
            identityNumber: formData.identityNumber,
            taxId: formData.taxId,
            birthDate: type === 'PERSONAL' && formData.birthDate
                ? new Date(formData.birthDate).toISOString()
                : '',
            establishmentDate: type === 'CORPORATE' && formData.birthDate
                ? new Date(formData.birthDate).toISOString()
                : '',
            attributes,
            ...(applicantId ? {} : { createdAt: now })
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

    const inputClass = "h-9 rounded-md";

    const renderField = (field: AttributeRegistry) => {
        const id = field.attributeCode;
        const rawLabel = field.uiLabel || field.description || id;
        const label = t`${rawLabel}`;
        const isRequired = field.isRequired;

        const labelContent = (
            <Label className="text-xs font-medium text-muted-foreground">
                {label} {isRequired && <span className="text-destructive">*</span>}
            </Label>
        );

        if (field.dataType?.toUpperCase() === 'SELECT' && field.choices && field.choices.length > 0) {
            return (
                <div key={id} className="space-y-1.5">
                    {labelContent}
                    <Select onValueChange={(v) => handleSelectChange(id, v)} value={formData[id] || ''}>
                        <SelectTrigger className={inputClass}>
                            <SelectValue placeholder={t`Pilih ${label}...`} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.choices
                                .slice()
                                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                                .map(opt => (
                                    <SelectItem key={opt.id || opt.code} value={opt.code}>
                                        {opt.value}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        const commonOptions = COMMON_OPTIONS[id];
        if (commonOptions) {
            return (
                <div key={id} className="space-y-1.5">
                    {labelContent}
                    <Select onValueChange={(v) => handleSelectChange(id, v)} value={formData[id] || ''}>
                        <SelectTrigger className={inputClass}>
                            <SelectValue placeholder={t`Pilih ${label}...`} />
                        </SelectTrigger>
                        <SelectContent>
                            {commonOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        switch (field.dataType?.toUpperCase()) {
            case 'SELECT':
                return (
                    <div key={id} className="space-y-1.5">
                        {labelContent}
                        <Input id={id} name={id} value={formData[id] || ''} onChange={handleInputChange} className={inputClass} placeholder={t`Masukkan ${label}`} />
                    </div>
                );
            case 'BOOLEAN':
                return (
                    <div key={id} className="space-y-1.5">
                        {labelContent}
                        <Select onValueChange={(v) => handleSelectChange(id, v)} value={formData[id] || ''}>
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder={t`Pilih...`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">{t`Ya`}</SelectItem>
                                <SelectItem value="false">{t`Tidak`}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'DATE':
                return (
                    <div key={id} className="space-y-1.5">
                        {labelContent}
                        <Input id={id} name={id} type="date" value={formData[id] || ''} onChange={handleInputChange} className={inputClass} />
                    </div>
                );
            case 'NUMBER':
                return (
                    <div key={id} className="space-y-1.5">
                        {labelContent}
                        <Input id={id} name={id} type="number" value={formData[id] || ''} onChange={handleInputChange} className={inputClass} />
                    </div>
                );
            default:
                return (
                    <div key={id} className="space-y-1.5">
                        {labelContent}
                        <Input id={id} name={id} value={formData[id] || ''} onChange={handleInputChange} className={inputClass} placeholder={t`Masukkan ${label}`} />
                    </div>
                );
        }
    };

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
                                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClass} placeholder={t`Masukkan Nama Sesuai Identitas`} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        {type === 'PERSONAL' ? t`NIK / No. KTP` : t`NIB / No. Izin`} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input id="identityNumber" name="identityNumber" value={formData.identityNumber} onChange={handleInputChange} className={inputClass} placeholder="1234567890..." />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        {t`NPWP (Opsional)`}
                                    </Label>
                                    <Input id="taxId" name="taxId" value={formData.taxId} onChange={handleInputChange} className={inputClass} placeholder="00.000.000.0-000.000" />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        {type === 'PERSONAL' ? t`Tanggal Lahir` : t`Tanggal Pendirian`}
                                    </Label>
                                    <Input
                                        id="birthDate"
                                        name="birthDate"
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                    />
                                </div>
                            </>
                        )}

                        {steps[currentStep]?.fields?.map((field: AttributeRegistry) => renderField(field))}
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
                        onClick={currentStep === steps.length - 1 ? () => setIsConfirmOpen(true) : nextStep}
                        className={currentStep === steps.length - 1 ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                        {currentStep === steps.length - 1 ? t`Simpan Applicant` : t`Langkah Berikutnya`}
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
