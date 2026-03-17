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
    IdCard,
    Book,
    Store,
    ShieldCheck,
    UserCheck, UserX, Users, Baby, PersonStanding, Fingerprint, ScanFace,
    MessageSquare, Send, AtSign, Bell, Rss, Radio,
    Factory, Landmark, Newspaper, ClipboardList, Award, Star,
    CreditCard, Banknote, Wallet, PiggyBank, TrendingUp, TrendingDown, BarChart2, Receipt,
    Shield, Stethoscope, AlertTriangle, ThumbsUp, ThumbsDown,
    Globe, Car, Truck, Plane, Anchor, Navigation,
    FileText, File, FolderOpen, BookOpen, Link, Hash, Tag, Paperclip,
    Clock, Timer, Hourglass,
    Zap, Lock, Key, Eye, Cpu, Wifi, Image, Smile,
    Trash2,
} from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { applicantService, referenceService } from '@/core/api';
import { AttributeRegistry, ApplicantType } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn, formatThousands, parseThousands } from '@/shared/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/shared/ui/checkbox';

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
        GraduationCap, Home, Calendar, UserPlus, Save,
        IdCard, Book, Store, ShieldCheck, UserCheck, 
        UserX, Users, Baby, PersonStanding, Fingerprint, ScanFace,
        MessageSquare, Send, AtSign, Bell, Rss, Radio,
        Factory, Landmark, Newspaper, ClipboardList, Award, Star,
        CreditCard, Banknote, Wallet, PiggyBank, TrendingUp, TrendingDown, BarChart2, Receipt,
        Shield, Stethoscope, AlertTriangle, ThumbsUp, ThumbsDown,
        Globe, Car, Truck, Plane, Anchor, Navigation,
        FileText, File, FolderOpen, BookOpen, Link, Hash, Tag, Paperclip,
        Clock, Timer, Hourglass,
        Zap, Lock, Key, Eye, Cpu, Wifi, Image, Smile,
        Trash2,
    };

    // Normalize: kebab-case/snake_case to PascalCase
    const normalized = name
        .split(/[-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('');

    // Case-insensitive lookup
    const found = Object.keys(icons).find(k => k.toLowerCase() === normalized.toLowerCase());
    return found ? icons[found] : Settings;
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
const PRIMARY_KEYS = ['full_name', 'identity_number', 'tax_id', 'birth_date', 'tanggal_lahir', 'establishment_date', 'tanggal_pendirian', 'applicant_type'];

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
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = React.useState(false);
    const [pendingCancelAction, setPendingCancelAction] = React.useState<(() => void) | null>(null);
    const [isDomicileSameAsIdentity, setIsDomicileSameAsIdentity] = React.useState(false);

    const [formData, setFormData] = React.useState<Record<string, any>>({
        fullName: '',
        identityNumber: '',
        taxId: '',
        birthDate: '',
        establishmentDate: '',
    });

    // Sync semua field _ktp -> _domisili (khusus alamat_ktp -> domicile_address)
    const syncAddress = React.useCallback((currentData: Record<string, any>) => {
        const newData = { ...currentData };
        Object.keys(currentData).forEach(key => {
            if (key.endsWith('_ktp')) {
                const domKey = key === 'alamat_ktp' ? 'domicile_address' : key.replace('_ktp', '_domisili');
                newData[domKey] = currentData[key];
            }
        });
        return newData;
    }, []);

    React.useEffect(() => {
        if (isDomicileSameAsIdentity) {
            setFormData(prev => syncAddress(prev));
        }
    }, [isDomicileSameAsIdentity, syncAddress]);

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

    const getRegistryLabel = React.useCallback((code: string, fallback: string) => {
        const item = registry.find(r => r.attributeCode === code);
        return item?.uiLabel || item?.description || fallback;
    }, [registry]);

    const getCategoryLabel = React.useCallback((code: string, fallback: string) => {
        const cat = apiCategories.find(c => c.categoryCode === code);
        return cat?.categoryName || fallback;
    }, [apiCategories]);

    // ── Build steps from registry (scope=APPLICANT) ───────────────────────────
    // Dynamic attributes grouped by category
    const categories = React.useMemo(() => {
        const groups: Record<string, AttributeRegistry[]> = {};
        const categoriesWithRelevantFields = new Set<string>();

        registry.forEach(attr => {
            // Only APPLICANT scope (or no scope restriction)
            if (attr.scope && attr.scope !== 'APPLICANT') return;
            
            // Refined appliesTo logic
            const targetApplies = (attr.appliesTo || '').toUpperCase();
            const currentType = type.toUpperCase();
            const isMatch = targetApplies === 'BOTH' || 
                            targetApplies === currentType ||
                            (currentType === 'CORPORATE' && targetApplies === 'COMPANY');
            
            if (!isMatch) return;

            const catCode = attr.categoryCode || 'IDENTITAS';
            categoriesWithRelevantFields.add(catCode);

            if (PRIMARY_KEYS.includes(attr.attributeCode)) return;

            if (!groups[catCode]) groups[catCode] = [];
            groups[catCode].push(attr);
        });

        if (apiCategories.length > 0) {
            return apiCategories
                .filter(cat => !!cat)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map(cat => ({
                    id: (cat.categoryCode || '').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                    categoryCode: cat.categoryCode,
                    title: getCategoryLabel(cat.categoryCode || '', cat.categoryName || 'Lainnya'),
                    fields: (groups[cat.categoryCode] || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
                    iconName: cat.uiIcon,
                    hasRelevantAttributes: categoriesWithRelevantFields.has(cat.categoryCode),
                }))
                // Include category if it was EXPLICITLY marked as having relevant fields (core or dynamic)
                // OR if it's the IDENTITAS category (fallback safety)
                .filter(cat => cat.hasRelevantAttributes || cat.categoryCode === 'IDENTITAS');
        }

        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, fields]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                categoryCode: name,
                title: getCategoryLabel(name, name),
                fields: fields.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
                iconName: undefined,
            }))
            .filter(cat => cat.fields.length > 0 || cat.categoryCode === 'IDENTITAS');
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

    // Deteksi: apakah step saat ini adalah "Alamat Domisili"
    const isCurrentStepDomicile = React.useMemo(() => {
        const step = steps[currentStep];
        if (!step) return false;
        // Cek berdasarkan categoryCode (paling reliable)
        if (step.categoryCode === 'domicile_address') return true;
        // Fallback: cek field-field di step ini
        return step.fields.some(
            (f: AttributeRegistry) =>
                f.categoryCode === 'domicile_address' ||
                f.attributeCode === 'domicile_address' ||
                f.attributeCode?.includes('domisili') ||
                f.categoryCode?.includes('domicile') ||
                f.categoryCode?.includes('domisili')
        );
    }, [steps, currentStep]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (isDomicileSameAsIdentity && name.endsWith('_ktp')) {
                const domKey = name === 'alamat_ktp' ? 'domicile_address' : name.replace('_ktp', '_domisili');
                next[domKey] = value;
            }
            return next;
        });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (isDomicileSameAsIdentity && name.endsWith('_ktp')) {
                const domKey = name === 'alamat_ktp' ? 'domicile_address' : name.replace('_ktp', '_domisili');
                next[domKey] = value;
            }
            return next;
        });
    };

    const nextStep = () => {
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
            birthDate: type === 'PERSONAL' && formData.birthDate ? formData.birthDate : '',
            establishmentDate: type === 'CORPORATE' && formData.birthDate ? formData.birthDate : '',
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
        const isDisabled = isDomicileSameAsIdentity && (id.endsWith('_domisili') || id === 'domicile_address');

        const labelContent = (
            <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                {field.categoryIcon && <FieldIcon className="h-4 w-4 text-primary/70" />}
                {label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
        );

        // SELECT with registry options
        if (field.dataType?.toUpperCase() === 'SELECT' && field.choices && field.choices.length > 0) {
            return (
                <div key={id} className="space-y-1">
                    {labelContent}
                    <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id] || ''} disabled={isDisabled}>
                        <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-slate-200">
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

        // COMMON hardcoded options
        const commonOptions = COMMON_OPTIONS[id];
        if (commonOptions) {
            return (
                <div key={id} className="space-y-1">
                    {labelContent}
                    <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id] || ''} disabled={isDisabled}>
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
                        <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id] || ''} disabled={isDisabled}>
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
                        <Input id={id} name={id} type="date" value={formData[id] || ''} onChange={handleInputChange} className="rounded-xl h-11 bg-slate-50 border-slate-200" disabled={isDisabled} />
                    </div>
                );
            case 'NUMBER': {
                const displayValue = formatThousands(formData[id]);
                return (
                    <div key={id} className="space-y-1">
                        {labelContent}
                        <Input
                            id={id}
                            name={id}
                            type="text"
                            inputMode="numeric"
                            value={displayValue}
                            onChange={(e) => {
                                const raw = parseThousands(e.target.value);
                                if (raw === '' || /^\d+$/.test(raw)) {
                                    handleSelectChange(id, raw);
                                }
                            }}
                            className="rounded-xl h-11 bg-slate-50 border-slate-200"
                            disabled={isDisabled}
                            placeholder="0"
                        />
                    </div>
                );
            }
            default:
                return (
                    <div key={id} className="space-y-1">
                        {labelContent}
                        <Input id={id} name={id} value={formData[id] || ''} onChange={handleInputChange} className="rounded-xl h-11 bg-slate-50 border-slate-200" placeholder={t`Masukkan ${label}`} disabled={isDisabled} />
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
                                            {getRegistryLabel('full_name', t`Nama Lengkap`)} <span className="text-red-500">*</span>
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
                                            {type === 'PERSONAL' 
                                                ? getRegistryLabel('identity_number', t`NIK / No. KTP`) 
                                                : getRegistryLabel('tax_id', t`NPWP`)} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="identityNumber"
                                            name="identityNumber"
                                            value={formData.identityNumber}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                if (type === 'PERSONAL') {
                                                    setFormData(prev => ({ ...prev, taxId: e.target.value }));
                                                }
                                            }}
                                            className="rounded-xl h-11 bg-slate-50 border-slate-200"
                                            placeholder={type === 'PERSONAL' ? '3271234567890001' : '00.000.000.0-000.000'}
                                            maxLength={type === 'PERSONAL' ? 16 : undefined}
                                        />
                                        {type === 'PERSONAL' && (
                                            <p className="text-[10px] text-muted-foreground">{t`NPWP otomatis sama dengan NIK`}</p>
                                        )}
                                    </div>

                                    {/* Tax ID - only show for corporate */}
                                    {type === 'CORPORATE' && (
                                        <div className="space-y-1">
                                            <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                                <Activity className="h-4 w-4 text-primary/70" />
                                                {getRegistryLabel('tax_id', t`NPWP Lama (Opsional)`)}
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
                                    )}

                                    {/* Birth / Establishment Date */}
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold flex items-center gap-2 mb-1.5 text-slate-700">
                                            <Calendar className="h-4 w-4 text-primary/70" />
                                            {type === 'PERSONAL' 
                                                ? getRegistryLabel('birth_date', getRegistryLabel('tanggal_lahir', t`Tanggal Lahir`)) 
                                                : getRegistryLabel('establishment_date', getRegistryLabel('tanggal_pendirian', t`Tanggal Pendirian`))}
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

                            {/* ─── Checkbox sinkronisasi alamat ─────────────────────────────────── */}
                            {/* Ditampilkan di atas semua field saat berada di step Alamat Domisili */}
                            {isCurrentStepDomicile && (
                                <div className="col-span-full mb-2">
                                    <div
                                        className={cn(
                                            'flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer',
                                            isDomicileSameAsIdentity
                                                ? 'bg-primary/10 border-primary/30 shadow-md'
                                                : 'bg-primary/5 border-primary/10 shadow-sm hover:bg-primary/10'
                                        )}
                                        onClick={() => setIsDomicileSameAsIdentity(prev => !prev)}
                                    >
                                        <Checkbox
                                            id="sync-address"
                                            checked={isDomicileSameAsIdentity}
                                            onCheckedChange={(checked: boolean) => setIsDomicileSameAsIdentity(!!checked)}
                                            className="border-primary data-[state=checked]:bg-primary mt-0.5 shrink-0"
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                        />
                                        <div className="flex flex-col gap-0.5">
                                            <Label htmlFor="sync-address" className="text-sm font-bold cursor-pointer text-primary select-none">
                                                {t`Alamat Domisili sama dengan Alamat KTP`}
                                            </Label>
                                            <span className="text-xs text-muted-foreground select-none">
                                                {t`Centang jika alamat domisili Anda sama dengan alamat yang tertera di KTP. Data akan disalin otomatis.`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Registry fields for this step */}
                            {steps[currentStep]?.fields?.map((field: AttributeRegistry) => (
                                <React.Fragment key={field.attributeCode}>
                                    {renderField(field)}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer navigation */}
                <div className="p-8 border-t bg-muted/10 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => {
                            const action = currentStep === 0
                                ? () => router.back()
                                : () => setCurrentStep(prev => prev - 1);
                            setPendingCancelAction(() => action);
                            setIsCancelConfirmOpen(true);
                        }}
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

            <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Batalkan Pengisian?`}</DialogTitle>
                        <DialogDescription>
                            {t`Data yang sudah diisi akan hilang. Apakah Anda yakin ingin keluar?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelConfirmOpen(false)}>
                            {t`Lanjut Mengisi`}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsCancelConfirmOpen(false);
                                pendingCancelAction?.();
                            }}
                        >
                            {t`Ya, Keluar`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
