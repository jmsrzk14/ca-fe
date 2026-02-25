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
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
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

export function DynamicApplicantForm({ applicantId, onSuccess, onCancel }: DynamicApplicantFormProps) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [type, setType] = React.useState<ApplicantType>('PERSONAL');
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    // 1. Fetch the "Buku Panduan" (Registry) from API
    const { data: registryResponse, isLoading: isRegistryLoading } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
    });

    const { data: applicantData, isLoading: isApplicantLoading } = useQuery({
        queryKey: ['applicant', applicantId],
        queryFn: () => applicantService.getById(applicantId!),
        enabled: !!applicantId,
    });


    const registry = (registryResponse?.attributes as AttributeRegistry[]) || [];

    // Form state: Core fields + Dynamic fields
    const [formData, setFormData] = React.useState<Record<string, any>>({
        fullName: '',
        identityNumber: '',
        taxId: '',
        birthDate: '',
        establishmentDate: '',
    });

    React.useEffect(() => {
        if (applicantData) {
            setType(applicantData.applicantType || 'PERSONAL');

            const newFormData: Record<string, any> = {
                fullName: applicantData.fullName || '',
                identityNumber: applicantData.identityNumber || '',
                taxId: applicantData.taxId || '',
                birthDate: applicantData.birthDate ? String(applicantData.birthDate).split('T')[0] : '',
                establishmentDate: applicantData.establishmentDate ? String(applicantData.establishmentDate).split('T')[0] : '',
            };

            applicantData.attributes?.forEach((attr: any) => {
                newFormData[attr.key] = attr.value;
            });

            setFormData(newFormData);
        }
    }, [applicantData]);
    // 2. Group Registry by Category to create Steps dynamically
    const categories = React.useMemo(() => {
        const groups: Record<string, AttributeRegistry[]> = {};

        // Ensure categories are sorted (1. Identitas, 2. Pasangan, etc.)
        // Also Filter out fields that are already handled as Primary Columns
        const primaryKeys = ['fullName', 'identityNumber', 'taxId', 'birthDate', 'establishmentDate', 'applicantType'];

        registry.forEach(attr => {
            if (primaryKeys.includes(attr.attrKey)) return;

            const catName = attr.category || 'IDENTITAS';
            if (!groups[catName]) {
                groups[catName] = [];
            }
            groups[catName].push(attr);
        });

        // Convert to sorted array of steps based on category name
        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, fields]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                title: t`${name}`,
                fields
            }));
    }, [registry, t]);

    // steps are now 100% driven by categories from registry
    const steps = React.useMemo(() => {
        return categories.map(cat => {
            let Icon = Settings;
            const name = cat.title.toUpperCase();
            if (name.includes('KONTAK')) Icon = Phone;
            if (name.includes('PEKERJAAN')) Icon = Briefcase;
            if (name.includes('FINANSIAL') || name.includes('USAHA')) Icon = DollarSign;
            if (name.includes('IDENTITAS') || name.includes('BIO')) Icon = User;
            if (name.includes('PERILAKU') || name.includes('KARAKTER')) Icon = Activity;
            if (name.includes('PASANGAN')) Icon = Heart;
            if (name.includes('DOKUMEN')) Icon = Building2;
            if (name.includes('PENDIDIKAN')) Icon = GraduationCap;
            if (name.includes('RUMAH')) Icon = Home;

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
        // Simple validation for the first step (Basic Info)
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

        // 1. Primary Columns as specified by USER
        const primaryKeys = [
            'applicantType',
            'identityNumber',
            'taxId',
            'fullName',
            'birthDate',
            'establishmentDate',
            'attributes',
            'createdAt'
        ];

        // 2. Map everything else to Attributes (Secondary Columns)
        const attributes = Object.entries(formData)
            .filter(([key, value]) => !primaryKeys.includes(key) && value !== undefined && value !== '')
            .map(([key, value]) => {
                const regItem = registry.find(r => r.attrKey === key);
                return {
                    key,
                    value: String(value),
                    dataType: regItem?.dataType || 'STRING',
                    updatedAt: now
                };
            });

        // 3. Assemble Primary Payload
        const payload = {
            applicantType: type,
            fullName: formData.fullName,
            identityNumber: formData.identityNumber,
            taxId: formData.taxId,
            birthDate: type === 'PERSONAL' && formData.birthDate ? new Date(formData.birthDate).toISOString() : '',
            establishmentDate: type === 'CORPORATE' && formData.establishmentDate ? new Date(formData.establishmentDate).toISOString() : '',
            attributes,
            ...(applicantId ? {} : { createdAt: now })
        };

        mutation.mutate(payload);
    };

    if (isRegistryLoading || (applicantId && isApplicantLoading)) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <span className="ml-3 font-medium">{t`Memuat data...`}</span>
            </div>
        );
    }

    // Helper to get Icon Component from string
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

    // Specific options for common fields to make the dynamic form feel premium
    const COMMON_OPTIONS: Record<string, { label: string, value: string }[]> = {
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
    };

    const renderField = (field: AttributeRegistry) => {
        const id = field.attrKey;
        const rawLabel = field.uiLabel || field.attrName || id;
        const label = t`${rawLabel}`;
        const isRequired = field.required;
        const FieldIcon = getIconWithName(field.uiIcon);

        const labelContent = (
            <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                {field.uiIcon && <FieldIcon className="h-4 w-4 text-orange-600/70" />}
                {label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
        );

        // Check if we have common options for this field key
        const options = COMMON_OPTIONS[id];
        if (options) {
            return (
                <div key={id} className="space-y-1">
                    {labelContent}
                    <Select onValueChange={(v) => handleSelectChange(id, v)} value={formData[id]}>
                        <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-slate-200">
                            <SelectValue placeholder={t`Pilih ${label}...`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        switch (field.dataType?.toUpperCase()) {
            case 'BOOLEAN':
                return (
                    <div key={id} className="space-y-1">
                        {labelContent}
                        <Select onValueChange={(v) => handleSelectChange(id, v)} value={formData[id]}>
                            <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-slate-200">
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
                    <div key={id} className="space-y-1">
                        {labelContent}
                        <Input id={id} name={id} type="date" value={formData[id] || ''} onChange={handleInputChange} className="rounded-xl h-11 bg-slate-50 border-slate-200" />
                    </div>
                );
            case 'NUMBER':
                return (
                    <div key={id} className="space-y-1">
                        {labelContent}
                        <Input id={id} name={id} type="number" value={formData[id] || ''} onChange={handleInputChange} className="rounded-xl h-11 bg-slate-50 border-slate-200" />
                    </div>
                );
            default:
                return (
                    <div key={id} className="space-y-1">
                        {labelContent}
                        <Input id={id} name={id} value={formData[id] || ''} onChange={handleInputChange} className="rounded-xl h-11 bg-slate-50 border-slate-200" placeholder={t`Masukkan ${label}`} />
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full bg-background rounded-3xl border border-border overflow-hidden shadow-2xl">
            {/* Dynamic Step Header */}
            <div className="hidden lg:flex border-b bg-muted/30">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={cn(
                            "flex-1 flex items-center justify-center py-4 px-2 gap-2 transition-all cursor-pointer border-b-2",
                            index === currentStep ? "border-orange-500 text-orange-600 bg-orange-50/50" : "border-transparent text-muted-foreground"
                        )}
                        onClick={() => index <= currentStep && setCurrentStep(index)}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider">{step.title}</span>
                    </div>
                ))}
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="min-h-[400px]">
                    {/* 
                        We render the current step's fields.
                        If it's the first step (Identitas), we also inject the CORE fields.
                    */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {currentStep === 0 && (
                            <>
                                <div className="col-span-full mb-4">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 block">{t`Tipe Applicant`}</Label>
                                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-inner">
                                        <button
                                            onClick={() => setType('PERSONAL')}
                                            className={cn(
                                                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                                type === 'PERSONAL' ? "bg-white text-orange-600 shadow-md ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            <User className="h-4 w-4" />
                                            {t`Individu`}
                                        </button>
                                        <button
                                            onClick={() => setType('CORPORATE')}
                                            className={cn(
                                                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                                type === 'CORPORATE' ? "bg-white text-orange-600 shadow-md ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            <Building2 className="h-4 w-4" />
                                            {t`Perusahaan`}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1 col-span-full md:col-span-2">
                                    <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                        <User className="h-4 w-4 text-orange-600/70" />
                                        {t`Nama Lengkap`} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="rounded-xl h-11 bg-slate-50 border-slate-200" placeholder={t`Masukkan Nama Sesuai Identitas`} />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                        <CheckCircle2 className="h-4 w-4 text-orange-600/70" />
                                        {type === 'PERSONAL' ? t`NIK / No. KTP` : t`NIB / No. Izin`} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="identityNumber" name="identityNumber" value={formData.identityNumber} onChange={handleInputChange} className="rounded-xl h-11 bg-slate-50 border-slate-200" placeholder="1234567890..." />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                        <Activity className="h-4 w-4 text-orange-600/70" />
                                        {t`NPWP (Opsional)`}
                                    </Label>
                                    <Input id="taxId" name="taxId" value={formData.taxId} onChange={handleInputChange} className="rounded-xl h-11 bg-slate-50 border-slate-200" placeholder="00.000.000.0-000.000" />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                        <Calendar className="h-4 w-4 text-orange-600/70" />
                                        {type === 'PERSONAL' ? t`Tanggal Lahir` : t`Tanggal Pendirian`}
                                    </Label>
                                    <Input
                                        id={type === 'PERSONAL' ? "birthDate" : "establishmentDate"}
                                        name={type === 'PERSONAL' ? "birthDate" : "establishmentDate"}
                                        type="date"
                                        value={type === 'PERSONAL' ? formData.birthDate : formData.establishmentDate}
                                        onChange={handleInputChange}
                                        className="rounded-xl h-11 bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </>
                        )}

                        {/* Registry Fields for Current Step */}
                        {steps[currentStep]?.fields?.map((field: AttributeRegistry) => renderField(field))}
                    </div>
                </div>
            </div>

            <div className="p-8 border-t bg-muted/10 flex items-center justify-between">
                <Button variant="outline" onClick={currentStep === 0 ? onCancel : () => setCurrentStep(prev => prev - 1)} className="rounded-xl px-8 h-12">
                    {currentStep === 0 ? t`Batal` : t`Kembali`}
                </Button>

                <Button
                    onClick={currentStep === steps.length - 1 ? () => setIsConfirmOpen(true) : nextStep}
                    className={cn(
                        "rounded-xl px-8 h-12 font-bold",
                        currentStep === steps.length - 1 ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
                    )}
                >
                    {currentStep === steps.length - 1 ? t`Simpan Applicant` : t`Langkah Berikutnya`}
                </Button>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Konfirmasi Simpan`}</DialogTitle>
                        <DialogDescription>{t`Semua field dinamis akan disimpan ke sistem EAV.`}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>{t`Batal`}</Button>
                        <Button onClick={performSubmit} disabled={mutation.isPending}>{t`Ya, Simpan`}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
