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
    UserPlus,
} from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { applicantService, referenceService } from '@/core/api';
import { AttributeRegistry, ApplicantType } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { useRouter } from 'next/navigation';

interface ApplicantAddPageProps {
    /** After successful submit, redirect to this path (default: /borrowers) */
    redirectTo?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const getIconWithName = (name?: string) => {
    if (!name) return Settings;
    const icons: Record<string, any> = {
        User, Building2, Settings, CheckCircle2,
        Phone, Mail, MapPin, Briefcase, DollarSign, Activity, Heart,
        GraduationCap, Home,
    };
    return icons[name] || Settings;
};

const getCommonOptions = (): Record<string, { label: string; value: string }[]> => ({
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
    ],
});

// Core fields handled as primary columns — excluded from dynamic registry steps
const PRIMARY_KEYS = ['fullName', 'identityNumber', 'taxId', 'birthDate', 'establishmentDate', 'applicantType'];

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export function ApplicantAddPage({ redirectTo = '/borrowers' }: ApplicantAddPageProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const COMMON_OPTIONS = React.useMemo(() => getCommonOptions(), []);

    const [type, setType] = React.useState<ApplicantType>('PERSONAL');
    const [currentStep, setCurrentStep] = React.useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    const [formData, setFormData] = React.useState<Record<string, any>>({
        fullName: '',
        identityNumber: '',
        taxId: '',
        birthDate: '',
        establishmentDate: '',
    });

    // ── Queries ────────────────────────────────────────────────────────────────
    const { data: registryResponse, isLoading: isRegistryLoading } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
    });

    const { data: categoriesResponse, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['attribute-categories'],
        queryFn: () => referenceService.listAttributeCategories(),
    });

    const registry = (registryResponse?.attributes as AttributeRegistry[]) || [];
    const apiCategories = categoriesResponse?.categories || [];

    // ── Build steps from registry (scope=APPLICANT) ───────────────────────────
    const categories = React.useMemo(() => {
        const groups: Record<string, AttributeRegistry[]> = {};

        registry.forEach(attr => {
            // Only APPLICANT scope (or no scope restriction)
            if (attr.scope && attr.scope !== 'APPLICANT') return;
            if (PRIMARY_KEYS.includes(attr.attributeCode)) return;
            if (attr.appliesTo !== 'BOTH' && attr.appliesTo !== type) return;

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
                    iconName: cat.uiIcon,
                }))
                .filter(cat => cat.fields.length > 0); // skip empty categories
        }

        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, fields]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                title: name,
                fields,
                iconName: undefined,
            }));
    }, [registry, apiCategories, type]);

    const steps = React.useMemo(() =>
        categories.map(cat => {
            let Icon = Settings;
            const name = cat.title.toUpperCase();
            if (cat.iconName) {
                Icon = getIconWithName(cat.iconName);
            } else {
                if (name.includes('KONTAK')) Icon = Phone;
                else if (name.includes('PEKERJAAN')) Icon = Briefcase;
                else if (name.includes('FINANSIAL') || name.includes('USAHA')) Icon = DollarSign;
                else if (name.includes('IDENTITAS') || name.includes('BIO')) Icon = User;
                else if (name.includes('PERILAKU') || name.includes('KARAKTER')) Icon = Activity;
                else if (name.includes('PASANGAN')) Icon = Heart;
                else if (name.includes('DOKUMEN')) Icon = Building2;
                else if (name.includes('PENDIDIKAN')) Icon = GraduationCap;
                else if (name.includes('RUMAH') || name.includes('ALAMAT')) Icon = Home;
            }
            return { ...cat, icon: Icon };
        }), [categories]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (currentStep === 0) {
            if (!formData.fullName || !formData.identityNumber) {
                toast.error(t`Harap isi Nama Lengkap dan NIK/NIB`);
                return;
            }
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    // ── Mutation ───────────────────────────────────────────────────────────────
    const mutation = useMutation({
        mutationFn: (data: any) => applicantService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            toast.success(t`Peminjam berhasil ditambahkan`);
            router.push(redirectTo);
        },
        onError: (error: any) => {
            toast.error(error.message || t`Gagal menambahkan peminjam`);
        },
    });

    const performSubmit = () => {
        setIsConfirmOpen(false);
        const now = new Date().toISOString();

        const attributes = Object.entries(formData)
            .filter(([key, value]) => !PRIMARY_KEYS.includes(key) && value !== undefined && value !== '')
            .map(([key, value]) => {
                const regItem = registry.find(r => r.attributeCode === key);
                return {
                    key: regItem?.id || key,
                    value: String(value),
                    dataType: regItem?.dataType || 'STRING',
                    updatedAt: now,
                };
            });

        const payload = {
            applicantType: type,
            fullName: formData.fullName,
            identityNumber: formData.identityNumber,
            taxId: formData.taxId,
            birthDate: type === 'PERSONAL' && formData.birthDate ? new Date(formData.birthDate).toISOString() : '',
            establishmentDate: type === 'CORPORATE' && formData.birthDate ? new Date(formData.birthDate).toISOString() : '',
            attributes,
            createdAt: now,
        };

        mutation.mutate(payload);
    };

    // ── Render field ───────────────────────────────────────────────────────────
    const renderField = (field: AttributeRegistry) => {
        const id = field.attributeCode;
        const rawLabel = field.uiLabel || field.description || id;
        const label = t`${rawLabel}`;
        const isRequired = field.isRequired;
        const FieldIcon = getIconWithName(field.categoryIcon);

        const labelContent = (
            <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                {field.categoryIcon && <FieldIcon className="h-4 w-4 text-primary/70" />}
                {label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
        );

        // SELECT with registry options
        if (field.dataType?.toUpperCase() === 'SELECT' && field.options && field.options.length > 0) {
            return (
                <div key={id} className="space-y-1">
                    {labelContent}
                    <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id] || ''}>
                        <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-slate-200">
                            <SelectValue placeholder={t`Pilih ${label}...`} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options
                                .slice()
                                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                                .map(opt => (
                                    <SelectItem key={opt.id || opt.optionValue} value={opt.optionValue}>
                                        {opt.optionLabel}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        // COMMON hardcoded options
        const commonOptions = COMMON_OPTIONS[id];
        if (commonOptions) {
            return (
                <div key={id} className="space-y-1">
                    {labelContent}
                    <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id] || ''}>
                        <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-slate-200">
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
            case 'BOOLEAN':
                return (
                    <div key={id} className="space-y-1">
                        {labelContent}
                        <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id] || ''}>
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

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isRegistryLoading || isCategoriesLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 font-medium">{t`Memuat data...`}</span>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Page header */}
            <div className="flex flex-col gap-6">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="group -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        {t`Kembali`}
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t`Tambah Data Peminjam`}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{t`Isi informasi peminjam sesuai dokumen identitas`}</p>
                    </div>
                </div>
            </div>

            {/* Form card */}
            <div className="flex flex-col bg-background rounded-3xl border border-border overflow-hidden shadow-2xl">

                {/* Step header tabs */}
                <div className="hidden lg:flex border-b bg-slate-50/50 backdrop-blur-md sticky top-0 z-20">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    'flex-1 flex flex-col items-center justify-center py-5 px-2 gap-2 transition-all cursor-pointer border-b-2 relative group',
                                    index === currentStep
                                        ? 'border-primary text-primary bg-primary/5'
                                        : index < currentStep
                                            ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50/30'
                                            : 'border-transparent text-muted-foreground hover:bg-slate-100/50'
                                )}
                                onClick={() => index <= currentStep && setCurrentStep(index)}
                            >
                                <div className={cn(
                                    'h-8 w-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
                                    index === currentStep ? 'bg-primary/10' : index < currentStep ? 'bg-emerald-100' : 'bg-slate-100'
                                )}>
                                    {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-center">{step.title}</span>
                                {index === currentStep && (
                                    <div className="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-primary shadow-primary/30" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Form body */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <div className="max-w-4xl mx-auto min-h-[400px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Step 0: core fields + type selector */}
                            {currentStep === 0 && (
                                <>
                                    {/* Applicant type selector */}
                                    <div className="col-span-full mb-4 flex flex-col gap-4 p-8 rounded-3xl bg-slate-50/50 border border-slate-200/50 shadow-inner">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-bold text-slate-800">{t`Tipe Peminjam`}:</h3>
                                            </div>
                                            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setType('PERSONAL')}
                                                    className={cn(
                                                        'px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5',
                                                        type === 'PERSONAL'
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                    )}
                                                >
                                                    <User className="h-4 w-4" />
                                                    {t`Perorangan`}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setType('CORPORATE')}
                                                    className={cn(
                                                        'px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5',
                                                        type === 'CORPORATE'
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                    )}
                                                >
                                                    <Building2 className="h-4 w-4" />
                                                    {t`Perusahaan`}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div className="space-y-1 col-span-full md:col-span-2">
                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                            <User className="h-4 w-4 text-primary/70" />
                                            {t`Nama Lengkap`} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="rounded-xl h-11 bg-slate-50 border-slate-200"
                                            placeholder={t`Masukkan Nama Sesuai Identitas`}
                                        />
                                    </div>

                                    {/* Identity Number */}
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                            <CheckCircle2 className="h-4 w-4 text-primary/70" />
                                            {type === 'PERSONAL' ? t`NIK / No. KTP` : t`NIB / No. Izin`} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="identityNumber"
                                            name="identityNumber"
                                            value={formData.identityNumber}
                                            onChange={handleInputChange}
                                            className="rounded-xl h-11 bg-slate-50 border-slate-200"
                                            placeholder="1234567890..."
                                        />
                                    </div>

                                    {/* Tax ID */}
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                            <Activity className="h-4 w-4 text-primary/70" />
                                            {t`NPWP (Opsional)`}
                                        </Label>
                                        <Input
                                            id="taxId"
                                            name="taxId"
                                            value={formData.taxId}
                                            onChange={handleInputChange}
                                            className="rounded-xl h-11 bg-slate-50 border-slate-200"
                                            placeholder="00.000.000.0-000.000"
                                        />
                                    </div>

                                    {/* Birth / Establishment Date */}
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                            <Calendar className="h-4 w-4 text-primary/70" />
                                            {type === 'PERSONAL' ? t`Tanggal Lahir` : t`Tanggal Pendirian`}
                                        </Label>
                                        <Input
                                            id="birthDate"
                                            name="birthDate"
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={handleInputChange}
                                            className="rounded-xl h-11 bg-slate-50 border-slate-200"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Registry fields for current step */}
                            {steps[currentStep]?.fields?.map((field: AttributeRegistry) => renderField(field))}
                        </div>
                    </div>
                </div>

                {/* Footer navigation */}
                <div className="p-8 border-t bg-muted/10 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={currentStep === 0 ? () => router.back() : () => setCurrentStep(prev => prev - 1)}
                        className="rounded-xl px-8 h-12"
                    >
                        {currentStep === 0 ? t`Batal` : t`Kembali`}
                    </Button>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-bold text-primary">{currentStep + 1}</span>
                        <span>/</span>
                        <span>{steps.length || 1}</span>
                    </div>

                    <Button
                        onClick={currentStep === steps.length - 1 ? () => setIsConfirmOpen(true) : nextStep}
                        className={cn(
                            'rounded-xl px-8 h-12 font-bold text-white gap-2',
                            currentStep === steps.length - 1
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-primary hover:bg-primary/90'
                        )}
                    >
                        {currentStep === steps.length - 1 ? (
                            <>{t`Simpan Peminjam`} <Save className="h-4 w-4" /></>
                        ) : (
                            <>{t`Langkah Berikutnya`} <ChevronRight className="h-4 w-4" /></>
                        )}
                    </Button>
                </div>
            </div>

            {/* Confirm dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Konfirmasi Simpan Peminjam`}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {t`Pastikan semua data peminjam sudah benar sebelum disimpan.`}
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>{t`Batal`}</Button>
                        <Button
                            onClick={performSubmit}
                            disabled={mutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t`Ya, Simpan`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
