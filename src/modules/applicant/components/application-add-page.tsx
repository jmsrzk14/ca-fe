'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Loader2,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    Search,
    Check,
    Building2,
    Settings,
    DollarSign,
    LayoutGrid,
} from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { applicationService, referenceService, applicantService } from '@/core/api';
import { AttributeRegistry } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent } from '@/shared/ui/card';
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
import Link from 'next/link';

interface ApplicationAddPageProps {
    redirectTo?: string;
}

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'branchCode') {
                updated.aoId = '';
            }
            return updated;
        });
    };

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

                let choiceId = undefined;
                if (dataType === 'SELECT' || dataType === 'BOOLEAN') {
                    const choice = regItem?.choices?.find(opt => opt.code === String(value));
                    if (choice) {
                        choiceId = choice.id;
                    }
                }

                return {
                    attributeId: attrId,
                    value: String(value),
                    dataType: dataType,
                    choiceId,
                };
            });

        const payload = {
            ...formData,
            tenorMonths: parseInt(String(formData.tenorMonths)) || 0,
            attributes,
        };

        mutation.mutate(payload);
    };

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
            <div className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">{t`Memuat formulir...`}</span>
            </div>
        );
    }

    const inputClass = "h-9 rounded-md";

    const renderDynamicField = (attr: AttributeRegistry) => {
        const id = attr.attributeCode;
        const label = t`${attr.uiLabel || attr.description || id}`;

        if (attr.dataType === 'SELECT') {
            return (
                <div key={id} className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                        {label} {attr.isRequired && <span className="text-destructive">*</span>}
                    </Label>
                    <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id] || ''}>
                        <SelectTrigger className={inputClass}>
                            <SelectValue placeholder={t`Pilih ${label}...`} />
                        </SelectTrigger>
                        <SelectContent>
                            {attr.choices?.map(opt => (
                                <SelectItem key={opt.id} value={opt.code}>{opt.value}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        if (attr.dataType === 'BOOLEAN') {
            return (
                <div key={id} className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                        {label} {attr.isRequired && <span className="text-destructive">*</span>}
                    </Label>
                    <Select onValueChange={v => handleSelectChange(id, v)} value={formData[id] || ''}>
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
        }

        return (
            <div key={id} className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                    {label} {attr.isRequired && <span className="text-destructive">*</span>}
                </Label>
                <Input
                    name={id}
                    type={attr.dataType === 'NUMBER' ? 'number' : attr.dataType === 'DATE' ? 'date' : 'text'}
                    value={formData[id] || ''}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder={t`Masukkan ${label}`}
                />
            </div>
        );
    };

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2" asChild>
                    <Link href="/loans">
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        {t`Kembali`}
                    </Link>
                </Button>
                <h1 className="text-lg font-bold text-foreground">{t`Buat Pengajuan Pinjaman Baru`}</h1>
            </div>

            <Card>
                <CardContent className="p-0">
                    {/* Step Header */}
                    <div className="flex border-b overflow-x-auto">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
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
                                    {index < currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
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
                                    {/* Applicant Selection */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            {t`Peminjam`} <span className="text-destructive">*</span>
                                        </Label>
                                        <Popover open={isApplicantPopoverOpen} onOpenChange={setIsApplicantPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={isApplicantPopoverOpen}
                                                    className={cn(inputClass, "w-full justify-between font-normal px-3")}
                                                >
                                                    {selectedApplicant ? (
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <span className="font-medium text-sm truncate">{selectedApplicant.fullName}</span>
                                                            <span className="text-[10px] text-muted-foreground truncate">
                                                                {selectedApplicant.identityNumber || selectedApplicant.taxId}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">{t`Pilih Peminjam...`}</span>
                                                    )}
                                                    <Search className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg border-border/50 shadow-lg overflow-hidden" align="start">
                                                <div className="flex flex-col max-h-[300px]">
                                                    <div className="flex items-center border-b px-3 h-9 sticky top-0 bg-background z-10">
                                                        <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                                        <input
                                                            className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                                            placeholder={t`Cari NIK atau Nama...`}
                                                            value={applicantSearch}
                                                            onChange={(e) => setApplicantSearch(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto py-1">
                                                        {filteredApplicants.length === 0 ? (
                                                            <div className="py-6 text-center text-xs text-muted-foreground">
                                                                {t`Peminjam tidak ditemukan.`}
                                                            </div>
                                                        ) : (
                                                            filteredApplicants.map((a: any) => (
                                                                <div
                                                                    key={a.id}
                                                                    className={cn(
                                                                        "flex cursor-pointer items-center px-3 py-2 text-sm transition-colors hover:bg-accent mx-1 rounded-sm",
                                                                        formData.applicantId === a.id && "bg-accent text-primary"
                                                                    )}
                                                                    onClick={() => {
                                                                        handleSelectChange('applicantId', a.id);
                                                                        setIsApplicantPopoverOpen(false);
                                                                        setApplicantSearch('');
                                                                    }}
                                                                >
                                                                    <div className="flex flex-col flex-1 min-w-0">
                                                                        <span className="font-medium text-sm truncate">{a.fullName}</span>
                                                                        <span className="text-[10px] text-muted-foreground truncate">{a.identityNumber || a.taxId}</span>
                                                                    </div>
                                                                    {formData.applicantId === a.id && (
                                                                        <Check className="h-3.5 w-3.5 ml-2 shrink-0 text-primary" />
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Branch */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            {t`Cabang`} <span className="text-destructive">*</span>
                                        </Label>
                                        <Select onValueChange={v => handleSelectChange('branchCode', v)} value={formData.branchCode}>
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue placeholder={t`Pilih Cabang...`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map(b => (
                                                    <SelectItem key={b.branchCode} value={b.branchCode}>{b.branchName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* AO */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            {t`Petugas (AO)`} <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            onValueChange={v => handleSelectChange('aoId', v)}
                                            value={formData.aoId}
                                            disabled={!formData.branchCode || isOfficersLoading}
                                        >
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue placeholder={isOfficersLoading ? t`Memuat...` : t`Pilih AO...`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {officers.map(o => (
                                                    <SelectItem key={o.id} value={o.id}>{o.officerCode}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Channel */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Saluran Pengajuan`}</Label>
                                        <Select onValueChange={v => handleSelectChange('applicationChannel', v)} value={formData.applicationChannel}>
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue placeholder={t`Pilih Saluran...`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BRANCH">{t`Cabang`}</SelectItem>
                                                <SelectItem value="ONLINE">{t`Online`}</SelectItem>
                                                <SelectItem value="MOBILE">{t`Mobile`}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {currentStep === 1 && (
                                <>
                                    {/* Product */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            {t`Produk Pinjaman`} <span className="text-destructive">*</span>
                                        </Label>
                                        <Select onValueChange={v => handleSelectChange('productId', v)} value={formData.productId}>
                                            <SelectTrigger className={inputClass}>
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
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            {t`Nilai Pinjaman`} <span className="text-destructive">*</span>
                                        </Label>
                                        <Input name="loanAmount" type="number" value={formData.loanAmount} onChange={handleInputChange} className={inputClass} placeholder="e.g. 50000000" />
                                    </div>

                                    {/* Tenor */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Tenor (Bulan)`}</Label>
                                        <Input name="tenorMonths" type="number" value={formData.tenorMonths} onChange={handleInputChange} className={inputClass} />
                                    </div>

                                    {/* Interest Rate */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Suku Bunga (%)`}</Label>
                                        <Input name="interestRate" type="number" step="0.01" value={formData.interestRate} onChange={handleInputChange} className={inputClass} />
                                    </div>

                                    {/* Interest Type */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Tipe Bunga`}</Label>
                                        <Select onValueChange={v => handleSelectChange('interestType', v)} value={formData.interestType}>
                                            <SelectTrigger className={inputClass}>
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
                                    <div className="space-y-1.5 col-span-full">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Tujuan Pinjaman`}</Label>
                                        <Input name="loanPurpose" value={formData.loanPurpose} onChange={handleInputChange} className={inputClass} placeholder={t`Contoh: Modal Kerja, Investasi, dll`} />
                                    </div>
                                </>
                            )}

                            {currentStep === 2 && (
                                <>
                                    {dynamicAttributes.length > 0 ? (
                                        dynamicAttributes.map(attr => renderDynamicField(attr))
                                    ) : (
                                        <p className="col-span-full py-12 text-center text-sm text-muted-foreground">{t`Tidak ada atribut tambahan`}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={currentStep === 0 ? () => router.push('/loans') : () => setCurrentStep(prev => prev - 1)}>
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                            {currentStep === 0 ? t`Batal` : t`Kembali`}
                        </Button>

                        <Button
                            size="sm"
                            onClick={currentStep === steps.length - 1 ? () => setIsConfirmOpen(true) : nextStep}
                            className={currentStep === steps.length - 1 ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        >
                            {currentStep === steps.length - 1 ? t`Submit Pengajuan` : t`Lanjut`}
                            {currentStep < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 ml-1" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Konfirmasi Pengajuan`}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">{t`Apakah Anda yakin data pengajuan ini sudah benar?`}</p>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setIsConfirmOpen(false)}>{t`Batal`}</Button>
                        <Button size="sm" onClick={performSubmit} disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                            {t`Ya, Buat Pengajuan`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
