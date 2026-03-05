'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Calendar,
    Mail,
    Phone,
    MapPin,
    User,
    Building2,
    Save,
    Loader2,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Heart,
    Home,
    GraduationCap,
    Briefcase,
    Store,
    Activity,
    UserPlus,
    Building,
    Settings,
    ShieldCheck,
    IdCard,
    Users,
    MapPin as MapPinIcon,
    Home as HomeIcon,
    GraduationCap as GradIcon,
    Briefcase as BriefIcon,
    Store as StoreIcon,
    ShieldCheck as ShieldIcon
} from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { applicantService } from '@/core/api';
import { ApplicantType } from '@/shared/types/api';
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
import { useQuery } from '@tanstack/react-query';
import { referenceService } from '@/core/api';

const ICON_MAP: Record<string, React.ElementType> = {
    'id-card': IdCard,
    'users': Users,
    'map-pin': MapPinIcon,
    'home': HomeIcon,
    'graduation-cap': GradIcon,
    'briefcase': BriefIcon,
    'store': StoreIcon,
    'shield-check': ShieldIcon,
    'default': Settings
};

interface ApplicantFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

// No longer using static STEP_FIELDS

export function ApplicantForm({ onSuccess, onCancel }: ApplicantFormProps) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [type, setType] = React.useState<ApplicantType>('PERSONAL');
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    const { data: registry, isLoading: isRegistryLoading } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
    });

    // Dynamically derive steps from registry
    const filteredAttributes = React.useMemo(() => {
        if (!registry?.attributes) return [];
        return registry.attributes.filter((attr: any) =>
            (attr.appliesTo === 'BOTH' || attr.appliesTo === type) &&
            attr.scope === 'APPLICANT'
        );
    }, [registry, type]);

    const STEPS = React.useMemo(() => {
        const categoriesMap = new Map();
        filteredAttributes.forEach((attr: any) => {
            if (!categoriesMap.has(attr.categoryCode)) {
                categoriesMap.set(attr.categoryCode, {
                    id: attr.categoryCode,
                    title: attr.categoryName,
                    icon: attr.categoryIcon
                });
            }
        });
        return Array.from(categoriesMap.values());
    }, [filteredAttributes]);

    const attributesByStep = React.useMemo(() => {
        const map: Record<string, any[]> = {};
        filteredAttributes.forEach((attr: any) => {
            if (!map[attr.categoryCode]) map[attr.categoryCode] = [];
            map[attr.categoryCode].push(attr);
        });
        return map;
    }, [filteredAttributes]);

    // Form state to persist data across steps
    const [formData, setFormData] = React.useState<Record<string, any>>({
        applicantType: 'PERSONAL',
        fullName: '',
        identityNumber: '',
        taxId: '',
        birthDate: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Mutation for creating applicant
    const mutation = useMutation({
        mutationFn: (data: any) => applicantService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            toast.success(t`Applicant created successfully`);
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.message || t`Failed to create applicant`);
        },
    });

    const validateStep = (stepIndex: number) => {
        const step = STEPS[stepIndex];
        if (!step) return true;

        const attributes = attributesByStep[step.id] || [];
        const missingFields = attributes
            .filter(attr => attr.isRequired && (!formData[attr.attributeCode] || (typeof formData[attr.attributeCode] === 'string' && formData[attr.attributeCode].trim() === '')))
            .map(attr => attr.uiLabel || attr.description);

        if (missingFields.length > 0) {
            toast.error(t`Harap isi kolom yang wajib diisi: ${missingFields.join(', ')}`);
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) return;

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // If it's the final submission and dialog not shown yet
        if (!isConfirmOpen) {
            if (!validateStep(currentStep)) return;
            setIsConfirmOpen(true);
            return;
        }

        performSubmit();
    };

    const performSubmit = () => {
        setIsConfirmOpen(false);

        // Map attribute codes to top-level proto fields if they match
        const TOP_LEVEL_MAPPING: Record<string, string> = {
            'full_name': 'fullName',
            'identity_number': 'identityNumber',
            'tax_id': 'taxId',
            'tanggal_lahir': 'birthDate',
            'establishment_date': 'establishmentDate'
        };

        const payload: any = {
            applicantType: type,
            attributes: []
        };

        // Initialize top-level fields
        Object.values(TOP_LEVEL_MAPPING).forEach(field => {
            payload[field] = '';
        });

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'applicantType') return;
            if (value === undefined || value === '') return;

            const topLevelField = TOP_LEVEL_MAPPING[key];
            if (topLevelField) {
                payload[topLevelField] = String(value);
            } else {
                const attrMeta = filteredAttributes.find(a => a.attributeCode === key);
                payload.attributes.push({
                    key,
                    value: String(value),
                    dataType: attrMeta?.dataType || 'STRING'
                });
            }
        });

        mutation.mutate(payload);
    };

    const renderField = (attr: any) => {
        const { attributeCode, uiLabel, description, dataType, isRequired, options } = attr;
        const labelText = uiLabel || description;

        switch (dataType) {
            case 'SELECT':
                return (
                    <div key={attributeCode} className="space-y-2">
                        <Label className="text-sm font-medium">
                            {labelText} {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Select
                            onValueChange={(v) => handleSelectChange(attributeCode, v)}
                            value={formData[attributeCode]}
                        >
                            <SelectTrigger className="rounded-xl h-11">
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
                    </div>
                );
            case 'BOOLEAN':
                return (
                    <div key={attributeCode} className="space-y-2">
                        <Label className="text-sm font-medium">
                            {labelText} {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Select
                            onValueChange={(v) => handleSelectChange(attributeCode, v === 'true' ? 'true' : 'false')}
                            value={String(formData[attributeCode])}
                        >
                            <SelectTrigger className="rounded-xl h-11">
                                <SelectValue placeholder={t`Pilih Jawaban`} />
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
                    <div key={attributeCode} className="space-y-2">
                        <Label htmlFor={attributeCode} className="text-sm font-medium">
                            {labelText} {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            id={attributeCode}
                            name={attributeCode}
                            type="date"
                            value={formData[attributeCode] || ''}
                            onChange={handleInputChange}
                            required={isRequired}
                            className="rounded-xl h-11"
                        />
                    </div>
                );
            case 'NUMBER':
                return (
                    <div key={attributeCode} className="space-y-2">
                        <Label htmlFor={attributeCode} className="text-sm font-medium">
                            {labelText} {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            id={attributeCode}
                            name={attributeCode}
                            type="number"
                            value={formData[attributeCode] || ''}
                            onChange={handleInputChange}
                            required={isRequired}
                            className="rounded-xl h-11"
                        />
                    </div>
                );
            default:
                return (
                    <div key={attributeCode} className="space-y-2">
                        <Label htmlFor={attributeCode} className="text-sm font-medium">
                            {labelText} {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            id={attributeCode}
                            name={attributeCode}
                            value={formData[attributeCode] || ''}
                            onChange={handleInputChange}
                            required={isRequired}
                            className="rounded-xl h-11"
                        />
                    </div>
                );
        }
    };

    const renderStepContent = () => {
        const step = STEPS[currentStep];
        if (!step) return null;

        const attributes = attributesByStep[step.id] || [];

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attributes.map(renderField)}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background/50 rounded-3xl border border-border/50 overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Multi-step Header */}
            <div className="hidden lg:flex border-b border-border/50 bg-muted/20">
                {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex-1 flex items-center justify-center py-5 px-3 gap-2 transition-all cursor-pointer border-b-2 relative",
                                isActive ? "bg-primary/5 border-primary text-primary" :
                                    isCompleted ? "bg-green-500/5 border-green-500 text-green-600" :
                                        "border-transparent text-muted-foreground hover:bg-muted/30"
                            )}
                            onClick={() => index <= currentStep && setCurrentStep(index)}
                        >
                            <div className={cn(
                                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                isActive ? "bg-primary text-white" :
                                    isCompleted ? "bg-green-600 text-white" :
                                        "bg-muted-foreground/20"
                            )}>
                                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : (
                                    (() => {
                                        const StepIcon = ICON_MAP[step.icon] ?? Settings;
                                        return <StepIcon className="h-4 w-4" />;
                                    })()
                                )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Step Header */}
            <div className="lg:hidden p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white font-bold">
                        {(() => {
                            const StepIcon = ICON_MAP[STEPS[currentStep].icon] ?? Settings;
                            return <StepIcon className="h-5 w-5" />;
                        })()}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-foreground">{STEPS[currentStep].title}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t`Langkah`} {currentStep + 1} {t`dari`} {STEPS.length}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {STEPS.map((_, i) => (
                        <div key={i} className={cn("h-1 w-4 rounded-full", i === currentStep ? "bg-primary" : i < currentStep ? "bg-green-600" : "bg-muted")} />
                    ))}
                </div>
            </div>

            {/* Type Switch (Only on Step 1) */}
            {currentStep === 0 && (
                <div className="px-8 pt-8">
                    <Tabs
                        value={type}
                        onValueChange={(v) => {
                            const newType = v as ApplicantType;
                            setType(newType);
                            setFormData(prev => ({ ...prev, applicantType: newType }));
                        }}
                        className="w-full"
                    >
                        <TabsList className="grid w-80 grid-cols-2 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="PERSONAL" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-9">
                                <User className="h-4 w-4" />
                                {t`Person`}
                            </TabsTrigger>
                            <TabsTrigger value="CORPORATE" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-9">
                                <Building2 className="h-4 w-4" />
                                {t`Company`}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            )}

            <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-250px)]">
                {(isRegistryLoading || isRegistryLoading === undefined) ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground font-medium">{t`Memuat formulir...`}</p>
                    </div>
                ) : (
                    <form id="applicant-form" onSubmit={handleSubmit}>
                        {renderStepContent()}
                    </form>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="p-8 border-t border-border/50 bg-muted/30 flex items-center justify-between">
                <div className="flex gap-3">
                    {currentStep === 0 ? (
                        onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl px-8 h-12 font-bold"
                                onClick={onCancel}
                            >
                                {t`Batal`}
                            </Button>
                        )
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl px-8 h-12 font-bold gap-2"
                            onClick={prevStep}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {t`Sebelumnya`}
                        </Button>
                    )}
                </div>

                <div className="flex gap-3">
                    {currentStep < STEPS.length - 1 ? (
                        <Button
                            type="button"
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 font-bold gap-2 shadow-lg shadow-primary/20"
                            onClick={nextStep}
                        >
                            {t`Langkah Berikutnya`}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            form="applicant-form"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-12 h-12 font-bold gap-2 shadow-lg shadow-green-600/20"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                            {t`Ajukan Pinjaman`}
                        </Button>
                    )}
                </div>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Konfirmasi Pengajuan`}</DialogTitle>
                        <DialogDescription>
                            {t`Apakah Anda yakin data yang diisi sudah benar? Data akan segera diproses.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={mutation.isPending}>
                            {t`Batal`}
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => performSubmit()} disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t`Ya, Ajukan Sekarang`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
