'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Save,
    Loader2,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Search,
    User,
    Check,
    Building2,
    Settings,
    DollarSign,
    Briefcase,
    Calendar,
    Target,
    LayoutGrid,
} from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { applicationService, referenceService, applicantService } from '@/core/api';
import { AttributeRegistry } from '@/shared/types/api';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { useRouter, useSearchParams } from 'next/navigation';

interface ApplicationAddPageProps {
    /** Redirect after success */
    redirectTo?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const getIconWithName = (name?: string) => {
    if (!name) return Settings;
    const icons: Record<string, any> = {
        Building2, Settings, CheckCircle2,
        Briefcase, DollarSign, Target, Calendar,
    };
    return icons[name] || Settings;
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export function ApplicationAddPage({ redirectTo = '/loans' }: ApplicationAddPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const initialApplicantId = searchParams.get('applicantId') || '';

    const [currentStep, setCurrentStep] = React.useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [applicantSearch, setApplicantSearch] = React.useState('');
    const [isApplicantPopoverOpen, setIsApplicantPopoverOpen] = React.useState(false);

    const [formData, setFormData] = React.useState<Record<string, any>>({
        applicantId: initialApplicantId,
        branchCode: '',
        aoId: '',
        productId: '',
        loanAmount: '',
        tenorMonths: 0,
        interestType: '',
        interestRate: '',
        loanPurpose: '',
        applicationChannel: 'BRANCH',
    });

    const { data: registryResponse, isLoading: isRegistryLoading } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
    });

    const { data: branchesResponse } = useQuery({
        queryKey: ['branches'],
        queryFn: () => referenceService.getBranches(),
    });

    const { data: productsResponse } = useQuery({
        queryKey: ['loan-products'],
        queryFn: () => referenceService.getLoanProducts(),
    });

    const { data: officersResponse, isLoading: isOfficersLoading } = useQuery({
        queryKey: ['officers', formData.branchCode],
        queryFn: () => referenceService.listLoanOfficers(formData.branchCode),
        enabled: !!formData.branchCode,
    });

    const { data: applicantsResponse } = useQuery({
        queryKey: ['applicants'],
        queryFn: () => applicantService.list(),
    });

    const registry = (registryResponse?.attributes as AttributeRegistry[]) || [];
    const branches = branchesResponse?.branches || [];
    const products = productsResponse?.products || [];
    const officers = officersResponse?.officers || [];
    const applicants = (applicantsResponse as any)?.applicants || [];

    const filteredApplicants = React.useMemo(() => {
        if (!applicantSearch) return applicants;
        const q = applicantSearch.toLowerCase();
        return applicants.filter((a: any) =>
            a.fullName?.toLowerCase().includes(q) ||
            (a.identityNumber || a.taxId || '').toLowerCase().includes(q)
        );
    }, [applicants, applicantSearch]);

    const selectedApplicant = React.useMemo(
        () => applicants.find((a: any) => a.id === formData.applicantId),
        [applicants, formData.applicantId]
    );

    const CORE_APP_KEYS = [
        'applicantId', 'branchCode', 'aoId', 'productId', 'loanAmount',
        'tenorMonths', 'interestType', 'interestRate', 'loanPurpose', 'applicationChannel'
    ];

    const dynamicAttributes = React.useMemo(() => {
        return registry
            .filter(attr => attr.scope === 'APPLICATION' && !CORE_APP_KEYS.includes(attr.attributeCode))
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [registry]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Reset AO if branch changes
            if (name === 'branchCode') {
                updated.aoId = '';
            }
            return updated;
        });
    };

    // ── Mutation ───────────────────────────────────────────────────────────────
    const mutation = useMutation({
        mutationFn: (data: any) => applicationService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            toast.success(t`Pengajuan berhasil dibuat`);
            router.push(redirectTo);
        },
        onError: (error: any) => {
            toast.error(error.message || t`Gagal membuat pengajuan`);
        },
    });

    const performSubmit = () => {
        setIsConfirmOpen(false);

        const attributes = Object.entries(formData)
            .filter(([key, value]) => !CORE_APP_KEYS.includes(key) && value !== undefined && value !== '')
            .map(([key, value]) => {
                const regItem = registry.find(r => r.attributeCode === key);
                const attrId = regItem?.id || key;
                const dataType = regItem?.dataType || 'STRING';

                let attributeOptionId = undefined;
                if (dataType === 'SELECT' || dataType === 'BOOLEAN') {
                    const option = regItem?.options?.find(opt => opt.optionValue === String(value));
                    if (option) {
                        attributeOptionId = option.id;
                    }
                }

                return {
                    attributeId: attrId,
                    value: String(value),
                    dataType: dataType,
                    attributeOptionId,
                };
            });

        const payload = {
            ...formData,
            tenorMonths: parseInt(String(formData.tenorMonths)) || 0,
            attributes,
        };
        
        mutation.mutate(payload);
    };

    // ── Steps ──────────────────────────────────────────────────────────────────
    const steps = [
        { id: 'core', title: t`Informasi Dasar`, icon: Building2 },
        { id: 'details', title: t`Detail Pinjaman`, icon: DollarSign },
        { id: 'additional', title: t`Informasi Tambahan`, icon: LayoutGrid },
    ];

    const nextStep = () => {
        if (currentStep === 0) {
            if (!formData.branchCode || !formData.aoId || !formData.applicantId) {
                toast.error(t`Harap lengkapi Cabang, AO, dan Peminjam`);
                return;
            }
        }
        if (currentStep === 1) {
            if (!formData.productId || !formData.loanAmount) {
                toast.error(t`Harap lengkapi Produk dan Nilai Pinjaman`);
                return;
            }
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    if (isRegistryLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 font-medium">{t`Memuat formulir...`}</span>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-fit">
                    <ChevronLeft className="mr-2 h-4 w-4" /> {t`Kembali`}
                </Button>
                <h1 className="text-3xl font-bold">{t`Buat Pengajuan Pinjaman Baru`}</h1>
            </div>

            <div className="flex flex-col bg-background rounded-3xl border border-border overflow-hidden shadow-xl">
                {/* Tabs */}
                <div className="flex border-b bg-muted/5 sticky top-0 z-10">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    'flex-1 flex flex-col items-center py-5 px-2 gap-2 border-b-2 transition-all cursor-pointer',
                                    index === currentStep ? 'border-primary bg-primary/5 text-primary' : 'border-transparent text-muted-foreground'
                                )}
                                onClick={() => index <= currentStep && setCurrentStep(index)}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{step.title}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="p-10 space-y-8">
                    {currentStep === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                            {/* Applicant Selection (Searchable) */}
                            <div className="space-y-2">
                                <Label>{t`Peminjam`}*</Label>
                                <Popover open={isApplicantPopoverOpen} onOpenChange={setIsApplicantPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isApplicantPopoverOpen}
                                            className="w-full justify-between rounded-xl h-12 bg-slate-50 font-normal px-4 hover:bg-slate-100 border-none shadow-none"
                                        >
                                            {selectedApplicant ? (
                                                <div className="flex flex-col items-start overflow-hidden">
                                                    <span className="font-bold text-sm truncate w-full">{selectedApplicant.fullName}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate w-full">
                                                        {selectedApplicant.identityNumber || selectedApplicant.taxId}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">{t`Pilih Peminjam...`}</span>
                                            )}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-border/50 shadow-2xl overflow-hidden" align="start">
                                        <div className="flex flex-col max-h-[400px]">
                                            <div className="flex items-center border-b px-4 h-12 sticky top-0 bg-background z-10">
                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                <input
                                                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder={t`Cari NIK atau Nama...`}
                                                    value={applicantSearch}
                                                    onChange={(e) => setApplicantSearch(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1 overflow-y-auto py-2">
                                                {filteredApplicants.length === 0 ? (
                                                    <div className="py-10 text-center text-sm text-muted-foreground">
                                                        {t`Peminjam tidak ditemukan.`}
                                                    </div>
                                                ) : (
                                                    filteredApplicants.map((a: any) => (
                                                        <div
                                                            key={a.id}
                                                            className={cn(
                                                                "relative flex cursor-pointer select-none items-center rounded-sm px-4 py-3 text-sm outline-none transition-colors hover:bg-primary/5 mx-1",
                                                                formData.applicantId === a.id && "bg-primary/5 text-primary"
                                                            )}
                                                            onClick={() => {
                                                                handleSelectChange('applicantId', a.id);
                                                                setIsApplicantPopoverOpen(false);
                                                                setApplicantSearch('');
                                                            }}
                                                        >
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <span className="font-bold text-sm truncate">{a.fullName}</span>
                                                                <span className="text-[11px] opacity-70 truncate">{a.identityNumber || a.taxId}</span>
                                                            </div>
                                                            {formData.applicantId === a.id && (
                                                                <Check className="h-4 w-4 ml-2 shrink-0 text-primary" />
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Branch Selection */}
                            <div className="space-y-2">
                                <Label>{t`Cabang`}*</Label>
                                <Select onValueChange={v => handleSelectChange('branchCode', v)} value={formData.branchCode}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50">
                                        <SelectValue placeholder={t`Pilih Cabang...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map(b => (
                                            <SelectItem key={b.branchCode} value={b.branchCode}>{b.branchName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Officer Selection (Dependent on Branch) */}
                            <div className="space-y-2">
                                <Label>{t`Petugas (AO)`}*</Label>
                                <Select
                                    onValueChange={v => handleSelectChange('aoId', v)}
                                    value={formData.aoId}
                                    disabled={!formData.branchCode || isOfficersLoading}
                                >
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50">
                                        <SelectValue placeholder={isOfficersLoading ? t`Memuat...` : t`Pilih AO...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {officers.map(o => (
                                            <SelectItem key={o.id} value={o.id}>{o.officerCode}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Application Channel */}
                            <div className="space-y-2">
                                <Label>{t`Saluran Pengajuan`}</Label>
                                <Select onValueChange={v => handleSelectChange('applicationChannel', v)} value={formData.applicationChannel}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50">
                                        <SelectValue placeholder={t`Pilih Saluran...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BRANCH">{t`Cabang`}</SelectItem>
                                        <SelectItem value="ONLINE">{t`Online`}</SelectItem>
                                        <SelectItem value="MOBILE">{t`Mobile`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                            {/* Product */}
                            <div className="space-y-2">
                                <Label>{t`Produk Pinjaman`}*</Label>
                                <Select onValueChange={v => handleSelectChange('productId', v)} value={formData.productId}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50">
                                        <SelectValue placeholder={t`Pilih Produk...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.productName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Loan Amount */}
                            <div className="space-y-2">
                                <Label>{t`Nilai Pinjaman`}*</Label>
                                <Input
                                    name="loanAmount"
                                    type="number"
                                    value={formData.loanAmount}
                                    onChange={handleInputChange}
                                    className="rounded-xl h-12 bg-slate-50"
                                    placeholder="e.g. 50000000"
                                />
                            </div>

                            {/* Tenor */}
                            <div className="space-y-2">
                                <Label>{t`Tenor (Bulan)`}</Label>
                                <Input
                                    name="tenorMonths"
                                    type="number"
                                    value={formData.tenorMonths}
                                    onChange={handleInputChange}
                                    className="rounded-xl h-12 bg-slate-50"
                                />
                            </div>

                            {/* Interest Rate */}
                            <div className="space-y-2">
                                <Label>{t`Suku Bunga (%)`}</Label>
                                <Input
                                    name="interestRate"
                                    type="number"
                                    step="0.01"
                                    value={formData.interestRate}
                                    onChange={handleInputChange}
                                    className="rounded-xl h-12 bg-slate-50"
                                />
                            </div>

                            {/* Interest Type */}
                            <div className="space-y-2">
                                <Label>{t`Tipe Bunga`}</Label>
                                <Select onValueChange={v => handleSelectChange('interestType', v)} value={formData.interestType}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50">
                                        <SelectValue placeholder={t`Pilih Tipe Bunga...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FLAT">{t`Flat`}</SelectItem>
                                        <SelectItem value="EFFECTIVE">{t`Efektif`}</SelectItem>
                                        <SelectItem value="ANNUITY">{t`Anuitas`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Loan Purpose */}
                            <div className="col-span-full space-y-2">
                                <Label>{t`Tujuan Pinjaman`}</Label>
                                <Input
                                    name="loanPurpose"
                                    value={formData.loanPurpose}
                                    onChange={handleInputChange}
                                    className="rounded-xl h-12 bg-slate-50"
                                    placeholder={t`Contoh: Modal Kerja, Investasi, dll`}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                            {dynamicAttributes.length > 0 ? (
                                dynamicAttributes.map(attr => {
                                    const id = attr.attributeCode;
                                    const label = t`${attr.uiLabel || attr.description || id}`;
                                    return (
                                        <div key={id} className="space-y-2">
                                            <Label>{label} {attr.isRequired && '*'}</Label>
                                            {attr.dataType === 'SELECT' ? (
                                                <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id]}>
                                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 text-left">
                                                        <SelectValue placeholder={t`Pilih...`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {attr.options?.map(opt => (
                                                            <SelectItem key={opt.id} value={opt.optionValue}>{opt.optionLabel}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    name={id}
                                                    type={attr.dataType === 'NUMBER' ? 'number' : attr.dataType === 'DATE' ? 'date' : 'text'}
                                                    value={formData[id] || ''}
                                                    onChange={handleInputChange}
                                                    className="rounded-xl h-12 bg-slate-50"
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="col-span-full py-20 text-center text-muted-foreground">{t`Tidak ada atribut tambahan`}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t bg-muted/10 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={currentStep === 0 ? () => router.back() : () => setCurrentStep(prev => prev - 1)}
                    >
                        {currentStep === 0 ? t`Batal` : t`Kembali`}
                    </Button>
                    <Button
                        onClick={currentStep === steps.length - 1 ? () => setIsConfirmOpen(true) : nextStep}
                        className="rounded-2xl px-10 h-14 font-bold"
                    >
                        {currentStep === steps.length - 1 ? t`Submit Pengajuan` : t`Lanjut`}
                        {currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Konfirmasi Pengajuan`}</DialogTitle>
                    </DialogHeader>
                    <p>{t`Apakah Anda yakin data pengajuan ini sudah benar?`}</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>{t`Batal`}</Button>
                        <Button
                            onClick={performSubmit}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t`Ya, Buat Pengajuan`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
