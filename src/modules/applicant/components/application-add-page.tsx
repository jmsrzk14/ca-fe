'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Loader2,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    Building2,
    DollarSign,
    LayoutGrid,
} from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { applicationService, referenceService, applicantService } from '@/core/api';
import { AttributeRegistry } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { NumericInput } from '@/shared/ui/numeric-input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { SearchableSelect } from '@/shared/ui/searchable-select';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DynamicField } from '@/shared/components/dynamic-field';
import { buildDynamicSchema, resolveChoiceId } from '@/shared/lib/dynamic-form';

interface ApplicationAddPageProps {
    redirectTo?: string;
}

const coreStep0Schema = z.object({
    applicantId: z.string().min(1, 'Peminjam wajib dipilih'),
    branchCode: z.string().min(1, 'Cabang wajib dipilih'),
    aoId: z.string().min(1, 'Petugas (AO) wajib dipilih'),
    applicationChannel: z.string(),
});

const coreStep1Schema = z.object({
    productId: z.string().min(1, 'Produk pinjaman wajib dipilih'),
    loanAmount: z.string().min(1, 'Nilai pinjaman wajib diisi'),
    tenorMonths: z.string(),
    interestRate: z.string(),
    interestType: z.string(),
    loanPurpose: z.string(),
});

const CORE_APP_KEYS = [
    'applicantId', 'branchCode', 'aoId', 'productId', 'loanAmount',
    'tenorMonths', 'interestType', 'interestRate', 'loanPurpose', 'applicationChannel',
];

export function ApplicationAddPage({ redirectTo = '/loans' }: ApplicationAddPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const initialApplicantId = searchParams.get('applicantId') || '';

    const [currentStep, setCurrentStep] = React.useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = React.useState(false);
    const [pendingCancelAction, setPendingCancelAction] = React.useState<(() => void) | null>(null);

    // Dynamic attribute state
    const [dynamicData, setDynamicData] = React.useState<Record<string, string>>({});
    const [dynamicErrors, setDynamicErrors] = React.useState<Record<string, string>>({});

    const step0Form = useForm<z.infer<typeof coreStep0Schema>>({
        resolver: zodResolver(coreStep0Schema),
        defaultValues: {
            applicantId: initialApplicantId,
            branchCode: '',
            aoId: '',
            applicationChannel: 'BRANCH',
        },
    });

    const step1Form = useForm<z.infer<typeof coreStep1Schema>>({
        resolver: zodResolver(coreStep1Schema),
        defaultValues: {
            productId: '',
            loanAmount: '',
            tenorMonths: '0',
            interestRate: '',
            interestType: '',
            loanPurpose: '',
        },
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

    const branchCode = step0Form.watch('branchCode');

    const { data: officersResponse, isLoading: isOfficersLoading } = useQuery({
        queryKey: ['officers', branchCode],
        queryFn: () => referenceService.listLoanOfficers(branchCode),
        enabled: !!branchCode,
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

    const applicantOptions = React.useMemo(() =>
        applicants.map((a: any) => ({
            value: a.id,
            label: `${a.fullName} — ${a.identityNumber || a.taxId || ''}`,
        })),
        [applicants]
    );

    const dynamicAttributes = React.useMemo(() => {
        return registry
            .filter(attr => attr.scope === 'APPLICATION' && !CORE_APP_KEYS.includes(attr.attributeCode))
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [registry]);

    const dynamicSchema = React.useMemo(
        () => buildDynamicSchema(dynamicAttributes),
        [dynamicAttributes]
    );

    const handleDynamicChange = (key: string, value: string) => {
        setDynamicData(prev => ({ ...prev, [key]: value }));
        if (dynamicErrors[key]) {
            setDynamicErrors(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
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

        const s0 = step0Form.getValues();
        const s1 = step1Form.getValues();

        const attributes = Object.entries(dynamicData)
            .filter(([, value]) => value !== undefined && value !== '')
            .map(([key, value]) => {
                const regItem = registry.find(r => r.attributeCode === key);
                return {
                    attributeId: regItem?.id || key,
                    value: String(value),
                    dataType: regItem?.dataType || 'STRING',
                    choiceId: regItem ? resolveChoiceId(regItem, String(value)) : undefined,
                };
            });

        const payload = {
            applicantId: s0.applicantId,
            branchCode: s0.branchCode,
            aoId: s0.aoId,
            applicationChannel: s0.applicationChannel,
            productId: s1.productId,
            loanAmount: s1.loanAmount,
            tenorMonths: parseInt(s1.tenorMonths) || 0,
            interestRate: s1.interestRate,
            interestType: s1.interestType,
            loanPurpose: s1.loanPurpose,
            attributes,
        };

        mutation.mutate(payload);
    };

    const steps = [
        { id: 'core', title: t`Informasi Dasar`, icon: Building2 },
        { id: 'details', title: t`Detail Pinjaman`, icon: DollarSign },
        { id: 'additional', title: t`Informasi Tambahan`, icon: LayoutGrid },
    ];

    const validateAndNext = async () => {
        if (currentStep === 0) {
            const valid = await step0Form.trigger();
            if (!valid) {
                const firstError = Object.values(step0Form.formState.errors)[0];
                toast.error(firstError?.message as string || 'Harap lengkapi data');
                return;
            }
        }
        if (currentStep === 1) {
            const valid = await step1Form.trigger();
            if (!valid) {
                const firstError = Object.values(step1Form.formState.errors)[0];
                toast.error(firstError?.message as string || 'Harap lengkapi data');
                return;
            }
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const validateAndConfirm = () => {
        if (currentStep === 2 && dynamicAttributes.length > 0) {
            const stepData: Record<string, string> = {};
            for (const attr of dynamicAttributes) {
                stepData[attr.attributeCode] = dynamicData[attr.attributeCode] || '';
            }
            const result = dynamicSchema.safeParse(stepData);
            if (!result.success) {
                const errors: Record<string, string> = {};
                for (const issue of result.error.issues) {
                    errors[issue.path[0] as string] = issue.message;
                }
                setDynamicErrors(prev => ({ ...prev, ...errors }));
                toast.error(Object.values(errors)[0] || 'Harap lengkapi field yang wajib');
                return;
            }
        }
        setIsConfirmOpen(true);
    };

    if (isRegistryLoading) {
        return (
            <div className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">{t`Memuat formulir...`}</span>
            </div>
        );
    }

    const inputClass = 'h-9 rounded-md';

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
                                        <SearchableSelect
                                            options={applicantOptions}
                                            value={step0Form.watch('applicantId')}
                                            onValueChange={v => step0Form.setValue('applicantId', v, { shouldValidate: true })}
                                            placeholder={t`Pilih Peminjam...`}
                                            searchPlaceholder={t`Cari NIK atau Nama...`}
                                            className={inputClass}
                                        />
                                        {step0Form.formState.errors.applicantId && (
                                            <p className="text-[10px] text-destructive mt-0.5">{step0Form.formState.errors.applicantId.message}</p>
                                        )}
                                    </div>

                                    {/* Branch */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            {t`Cabang`} <span className="text-destructive">*</span>
                                        </Label>
                                        <SearchableSelect
                                            options={branches.map(b => ({ value: b.branchCode, label: b.branchName }))}
                                            value={step0Form.watch('branchCode')}
                                            onValueChange={v => {
                                                step0Form.setValue('branchCode', v, { shouldValidate: true });
                                                step0Form.setValue('aoId', '');
                                            }}
                                            placeholder={t`Pilih Cabang...`}
                                            searchPlaceholder={t`Cari Cabang...`}
                                            className={inputClass}
                                        />
                                        {step0Form.formState.errors.branchCode && (
                                            <p className="text-[10px] text-destructive mt-0.5">{step0Form.formState.errors.branchCode.message}</p>
                                        )}
                                    </div>

                                    {/* AO */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            {t`Petugas (AO)`} <span className="text-destructive">*</span>
                                        </Label>
                                        <SearchableSelect
                                            options={officers.map(o => ({ value: o.id, label: o.officerCode }))}
                                            value={step0Form.watch('aoId')}
                                            onValueChange={v => step0Form.setValue('aoId', v, { shouldValidate: true })}
                                            placeholder={isOfficersLoading ? t`Memuat...` : t`Pilih AO...`}
                                            searchPlaceholder={t`Cari AO...`}
                                            disabled={!branchCode || isOfficersLoading}
                                            className={inputClass}
                                        />
                                        {step0Form.formState.errors.aoId && (
                                            <p className="text-[10px] text-destructive mt-0.5">{step0Form.formState.errors.aoId.message}</p>
                                        )}
                                    </div>

                                    {/* Channel */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Saluran Pengajuan`}</Label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'BRANCH', label: t`Cabang` },
                                                { value: 'ONLINE', label: t`Online` },
                                                { value: 'MOBILE', label: t`Mobile` },
                                            ]}
                                            value={step0Form.watch('applicationChannel')}
                                            onValueChange={v => step0Form.setValue('applicationChannel', v)}
                                            placeholder={t`Pilih Saluran...`}
                                            className={inputClass}
                                        />
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
                                        <SearchableSelect
                                            options={products.map(p => ({ value: p.id, label: p.productName }))}
                                            value={step1Form.watch('productId')}
                                            onValueChange={v => step1Form.setValue('productId', v, { shouldValidate: true })}
                                            placeholder={t`Pilih Produk...`}
                                            searchPlaceholder={t`Cari Produk...`}
                                            className={inputClass}
                                        />
                                        {step1Form.formState.errors.productId && (
                                            <p className="text-[10px] text-destructive mt-0.5">{step1Form.formState.errors.productId.message}</p>
                                        )}
                                    </div>

                                    {/* Loan Amount */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            {t`Nilai Pinjaman`} <span className="text-destructive">*</span>
                                        </Label>
                                        <NumericInput
                                            value={step1Form.watch('loanAmount')}
                                            onValueChange={v => step1Form.setValue('loanAmount', v, { shouldValidate: true })}
                                            className={inputClass}
                                            placeholder="e.g. 50,000,000"
                                        />
                                        {step1Form.formState.errors.loanAmount && (
                                            <p className="text-[10px] text-destructive mt-0.5">{step1Form.formState.errors.loanAmount.message}</p>
                                        )}
                                    </div>

                                    {/* Tenor */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Tenor (Bulan)`}</Label>
                                        <NumericInput 
                                            value={step1Form.watch('tenorMonths')}
                                            onValueChange={v => step1Form.setValue('tenorMonths', v)}
                                            className={inputClass} 
                                        />
                                    </div>

                                    {/* Interest Rate */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Suku Bunga (%)`}</Label>
                                        <NumericInput 
                                            value={step1Form.watch('interestRate')}
                                            onValueChange={v => step1Form.setValue('interestRate', v)}
                                            allowDecimals
                                            className={inputClass} 
                                        />
                                    </div>

                                    {/* Interest Type */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Tipe Bunga`}</Label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'FLAT', label: t`Flat` },
                                                { value: 'EFFECTIVE', label: t`Efektif` },
                                                { value: 'ANNUITY', label: t`Anuitas` },
                                            ]}
                                            value={step1Form.watch('interestType')}
                                            onValueChange={v => step1Form.setValue('interestType', v)}
                                            placeholder={t`Pilih Tipe Bunga...`}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Loan Purpose */}
                                    <div className="space-y-1.5 col-span-full">
                                        <Label className="text-xs font-medium text-muted-foreground">{t`Tujuan Pinjaman`}</Label>
                                        <Input {...step1Form.register('loanPurpose')} className={inputClass} placeholder={t`Contoh: Modal Kerja, Investasi, dll`} />
                                    </div>
                                </>
                            )}

                            {currentStep === 2 && (
                                <>
                                    {dynamicAttributes.length > 0 ? (
                                        dynamicAttributes.map(attr => (
                                            <DynamicField
                                                key={attr.attributeCode}
                                                field={attr}
                                                value={dynamicData[attr.attributeCode] || ''}
                                                onChange={handleDynamicChange}
                                                error={dynamicErrors[attr.attributeCode]}
                                                inputClass={inputClass}
                                            />
                                        ))
                                    ) : (
                                        <p className="col-span-full py-12 text-center text-sm text-muted-foreground">{t`Tidak ada atribut tambahan`}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const action = currentStep === 0
                                    ? () => router.push('/loans')
                                    : () => setCurrentStep(prev => prev - 1);
                                setPendingCancelAction(() => action);
                                setIsCancelConfirmOpen(true);
                            }}
                        >
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                            {currentStep === 0 ? t`Batal` : t`Kembali`}
                        </Button>

                        <Button
                            size="sm"
                            onClick={currentStep === steps.length - 1 ? validateAndConfirm : validateAndNext}
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

            <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Batalkan Pengisian?`}</DialogTitle>
                        <DialogDescription>
                            {t`Data yang sudah diisi akan hilang. Apakah Anda yakin ingin keluar?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setIsCancelConfirmOpen(false)}>
                            {t`Lanjut Mengisi`}
                        </Button>
                        <Button
                            size="sm"
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
