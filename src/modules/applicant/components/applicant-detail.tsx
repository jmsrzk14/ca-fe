'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Copy,
    Settings,
    Loader2,
    X,
    Plus,
    Pencil,
    Trash2,
    Users,
} from 'lucide-react';
import { applicantService, applicationService } from '@/core/api';
import { useAttributeRegistry } from '@/shared/hooks/use-attribute-registry';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { SearchableSelect } from '@/shared/ui/searchable-select';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { t } from '@/shared/lib/t';

interface ApplicantDetailProps {
    id: string;
}

const TABS = ['Data Peminjam', 'Pihak Terkait', 'Daftar Pinjaman'] as const;
type Tab = (typeof TABS)[number];

export function ApplicantDetail({ id }: ApplicantDetailProps) {
    const [activeTab, setActiveTab] = React.useState<Tab>('Data Peminjam');
    const { getLabel, getAttributeConfig, isLoading: isRegistryLoading } = useAttributeRegistry();

    const { data: applicant, isLoading, error } = useQuery({
        queryKey: ['applicant', id],
        queryFn: () => applicantService.getById(id),
    });

    const { data: applicationsData, isLoading: isAppsLoading } = useQuery({
        queryKey: ['applications', { applicantId: id }],
        queryFn: () => applicationService.list({ applicantId: id }),
        enabled: !!id,
    });

    const groupedAttributes = React.useMemo(() => {
        if (!applicant) return [];

        const groups: Record<string, { label: string; value: string }[]> = {};
        const data = applicant;
        const attributes = data.attributes || [];

        const coreGroup = '1. Identitas';
        const coreItems = [
            {
                label: getLabel('applicant_type', t`Tipe Applicant`),
                value: data.applicantType ? data.applicantType.charAt(0).toUpperCase() + data.applicantType.slice(1).toLowerCase() : '',
            },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('company_name', t`Nama Perusahaan`)
                    : getLabel('full_name', t`Nama Lengkap`),
                value: data.fullName || '',
            },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('tax_id', t`NPWP`)
                    : getLabel('identity_number', t`NIK`),
                value: data.identityNumber || '',
            },
            {
                label: data.applicantType?.toUpperCase() === 'COMPANY'
                    ? getLabel('tanggal_pendirian', t`Tanggal Pendirian`)
                    : getLabel('tanggal_lahir', t`Tanggal Lahir`),
                value: data.birthDate
                    ? new Date(data.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                    : data.establishmentDate
                        ? new Date(data.establishmentDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                        : '',
            },
        ].filter(item => item.value && item.value !== '' && item.value !== '-');

        if (coreItems.length > 0) {
            groups[coreGroup] = coreItems;
        }

        attributes.forEach((attr: any) => {
            const config = getAttributeConfig(attr.attributeId);
            const catVal = config?.categoryName || 'Informasi Lainnya';
            const cat = t`${catVal}`;

            if (!attr.value || attr.value === '' || attr.value === '-') return;

            if (!groups[cat]) groups[cat] = [];

            groups[cat].push({
                label: config?.uiLabel || attr.attributeId || attr.key || 'Unknown Field',
                value: attr.value,
            });
        });

        // Filter out groups with no items after filtering empty values
        return Object.entries(groups)
            .filter(([_, items]) => items.length > 0)
            .sort((a, b) => a[0].localeCompare(b[0]));
    }, [applicant, getLabel, getAttributeConfig, t]);

    if (isLoading || isRegistryLoading) {
        return <DetailSkeleton />;
    }

    if (error || !applicant) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                    <X className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">{t`Applicant Not Found`}</p>
                <Button asChild variant="outline" size="sm">
                    <Link href="/borrowers">{t`Go Back to List`}</Link>
                </Button>
            </div>
        );
    }

    const data = applicant;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t`ID copied to clipboard`);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2" asChild>
                        <Link href="/borrowers">
                            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                            {t`Kembali`}
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-lg font-bold text-foreground">
                            {data.fullName}
                        </h1>
                        <Badge variant="secondary" className="capitalize">
                            {data.applicantType?.toLowerCase() || '-'}
                        </Badge>
                    </div>
                    <button
                        className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono hover:text-foreground transition-colors"
                        onClick={() => copyToClipboard(data.id)}
                    >
                        <Copy className="h-3 w-3" />
                        {data.id}
                    </button>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href={`/borrowers/${data.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                        {t`Edit Profil`}
                    </Link>
                </Button>
            </div>

            {/* Tabs + Content */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center border-b px-4 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors relative",
                                    activeTab === tab
                                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-5">
                        {activeTab === 'Data Peminjam' && (
                            <BorrowerDataView groupedAttributes={groupedAttributes} />
                        )}
                        {activeTab === 'Pihak Terkait' && (
                            <RelatedPartiesView
                                applicantId={id}
                                applicantType={data.applicantType}
                            />
                        )}
                        {activeTab === 'Daftar Pinjaman' && (
                            <LoansListView
                                isLoading={isAppsLoading}
                                applications={applicationsData?.applications}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/* ── Profile data: 2-column key-value table per category ── */
function BorrowerDataView({ groupedAttributes }: { groupedAttributes: [string, { label: string; value: string }[]][] }) {
    if (groupedAttributes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Settings className="h-6 w-6 mb-3 opacity-20" />
                <p className="text-sm">{t`Belum ada data profil.`}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groupedAttributes.map(([category, items]) => (
                <div key={category}>
                    <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
                        {category.replace(/^\d+\.\s*/, '')}
                    </h3>
                    <div className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 hover:bg-muted/5 transition-colors">
                                    <span className="text-xs text-muted-foreground">{item.label}</span>
                                    <span className="text-xs font-medium text-foreground text-right">{item.value || '-'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Related Parties ── */
const ROLE_OPTIONS_PERSONAL = [
    { value: 'SPOUSE', label: 'Pasangan' },
    { value: 'GUARANTOR', label: 'Penjamin' },
];
const ROLE_OPTIONS_CORPORATE = [
    { value: 'DIRECTOR', label: 'Direktur' },
    { value: 'COMMISSIONER', label: 'Komisaris' },
    { value: 'SHAREHOLDER', label: 'Pemegang Saham' },
    { value: 'GUARANTOR', label: 'Penjamin' },
];

interface PartyFormData {
    name: string;
    identifier: string;
    dateOfBirth: string;
    roleCode: string;
    ownershipPct: number;
    position: string;
    slikRequired: boolean;
}

const emptyPartyForm: PartyFormData = {
    name: '',
    identifier: '',
    dateOfBirth: '',
    roleCode: '',
    ownershipPct: 0,
    position: '',
    slikRequired: false,
};

function RelatedPartiesView({ applicantId, applicantType }: { applicantId: string; applicantType: string }) {
    const queryClient = useQueryClient();
    const { getLabel } = useAttributeRegistry();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [form, setForm] = React.useState<PartyFormData>(emptyPartyForm);

    const isCorporate = applicantType?.toUpperCase() === 'COMPANY' || applicantType?.toUpperCase() === 'CORPORATE';
    const roleOptions = isCorporate ? ROLE_OPTIONS_CORPORATE : ROLE_OPTIONS_PERSONAL;

    const { data: parties, isLoading } = useQuery({
        queryKey: ['applicant-parties', applicantId],
        queryFn: () => applicantService.listParties(applicantId),
        enabled: !!applicantId,
    });

    const addMutation = useMutation({
        mutationFn: (data: PartyFormData) =>
            applicantService.addParty(applicantId, {
                partyType: 'PERSON',
                name: data.name,
                identifier: data.identifier,
                dateOfBirth: data.dateOfBirth,
                roleCode: data.roleCode,
                ownershipPct: data.ownershipPct,
                position: data.position,
                slikRequired: data.slikRequired,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicant-parties', applicantId] });
            setDialogOpen(false);
            setForm(emptyPartyForm);
            toast.success(t`Pihak terkait berhasil ditambahkan`);
        },
        onError: (err: any) => {
            toast.error(err?.message || t`Gagal menambahkan pihak terkait`);
        },
    });

    const removeMutation = useMutation({
        mutationFn: ({ partyId, roleCode }: { partyId: string; roleCode: string }) =>
            applicantService.removeParty(applicantId, partyId, roleCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicant-parties', applicantId] });
            toast.success(t`Pihak terkait berhasil dihapus`);
        },
        onError: (err: any) => {
            toast.error(err?.message || t`Gagal menghapus pihak terkait`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.roleCode) {
            toast.error(t`Nama dan peran harus diisi`);
            return;
        }
        addMutation.mutate(form);
    };

    const getRoleLabel = (code: string) => {
        const all = [...ROLE_OPTIONS_PERSONAL, ...ROLE_OPTIONS_CORPORATE];
        return all.find((r) => r.value === code)?.label || code;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t`Memuat data pihak terkait...`}</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    {isCorporate ? t`Pengurus & Pemegang Saham` : t`Pasangan & Penjamin`}
                </h3>
                <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    {t`Tambah`}
                </Button>
            </div>

            {!parties?.length ? (
                <div className="text-center py-8 space-y-2">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">{t`Belum ada pihak terkait.`}</p>
                </div>
            ) : (
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-muted/30">
                                <TableHead>{getLabel('full_name', t`Nama`)}</TableHead>
                                <TableHead>{getLabel('identity_number', t`NIK`)}</TableHead>
                                <TableHead>{getLabel('tanggal_lahir', t`Tgl Lahir`)}</TableHead>
                                <TableHead>{getLabel('role_code', t`Peran`)}</TableHead>
                                {isCorporate && <TableHead>{getLabel('ownership_pct', t`Kepemilikan`)}</TableHead>}
                                {isCorporate && <TableHead>{getLabel('position', t`Jabatan`)}</TableHead>}
                                <TableHead>{getLabel('slik_required', t`SLIK`)}</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parties.map((p: any) => (
                                <TableRow key={`${p.partyId}-${p.roleCode}`}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">{p.identifier || '-'}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {p.dateOfBirth && p.dateOfBirth !== '0001-01-01'
                                            ? new Date(p.dateOfBirth).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {getRoleLabel(p.roleCode)}
                                        </Badge>
                                    </TableCell>
                                    {isCorporate && (
                                        <TableCell className="text-muted-foreground">
                                            {p.ownershipPct > 0 ? `${p.ownershipPct}%` : '-'}
                                        </TableCell>
                                    )}
                                    {isCorporate && (
                                        <TableCell className="text-muted-foreground">{p.position || '-'}</TableCell>
                                    )}
                                    <TableCell>
                                        <Badge variant={p.slikRequired ? 'default' : 'outline'} className="text-xs">
                                            {p.slikRequired ? 'Ya' : 'Tidak'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeMutation.mutate({ partyId: p.partyId, roleCode: p.roleCode })}
                                            disabled={removeMutation.isPending}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Add Party Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t`Tambah Pihak Terkait`}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>{t`Peran`}</Label>
                            <SearchableSelect
                                options={roleOptions}
                                value={form.roleCode}
                                onValueChange={(v) => setForm((f) => ({ ...f, roleCode: v }))}
                                placeholder={t`Pilih peran...`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t`Nama Lengkap`}</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder={t`Nama lengkap`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t`NIK`}</Label>
                            <Input
                                value={form.identifier}
                                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                                placeholder={t`Nomor identitas`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t`Tanggal Lahir`}</Label>
                            <Input
                                type="date"
                                value={form.dateOfBirth}
                                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                            />
                        </div>
                        {form.roleCode === 'SHAREHOLDER' && (
                            <div className="space-y-1.5">
                                <Label>{t`Persentase Kepemilikan`}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    value={form.ownershipPct || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, ownershipPct: parseFloat(e.target.value) || 0 }))}
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                        {(form.roleCode === 'DIRECTOR' || form.roleCode === 'COMMISSIONER') && (
                            <div className="space-y-1.5">
                                <Label>{t`Jabatan`}</Label>
                                <Input
                                    value={form.position}
                                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                                    placeholder={form.roleCode === 'DIRECTOR' ? t`Direktur Utama` : t`Komisaris Utama`}
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="slik_required"
                                checked={form.slikRequired}
                                onChange={(e) => setForm((f) => ({ ...f, slikRequired: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="slik_required" className="text-sm font-normal cursor-pointer">
                                {t`Wajib SLIK (Pengecekan BI Checking)`}
                            </Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                {t`Batal`}
                            </Button>
                            <Button type="submit" disabled={addMutation.isPending}>
                                {addMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                                {t`Simpan`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* ── Loans list table ── */
function LoansListView({ isLoading, applications }: { isLoading: boolean; applications?: any[] }) {
    const { getLabel } = useAttributeRegistry();
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t`Memuat data pinjaman...`}</span>
            </div>
        );
    }

    if (!applications?.length) {
        return (
            <div className="text-center py-8 space-y-2">
                <p className="text-sm text-muted-foreground">{t`Belum ada pinjaman.`}</p>
                <Button size="sm" variant="outline" asChild>
                    <Link href="/loans">
                        <Plus className="h-3.5 w-3.5" />
                        {t`Pengajuan Baru`}
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-muted/30">
                        <TableHead>{getLabel('loan_amount', t`Jumlah Pinjaman`)}</TableHead>
                        <TableHead>{getLabel('tenor_months', t`Tenor`)}</TableHead>
                        <TableHead>{getLabel('loan_purpose', t`Tujuan`)}</TableHead>
                        <TableHead>{getLabel('status', t`Status`)}</TableHead>
                        <TableHead>{getLabel('created_at', t`Tanggal`)}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.map((app: any) => (
                        <TableRow key={app.id}>
                            <TableCell>
                                <Link href={`/loans/${app.id}`} className="text-xs font-semibold text-primary hover:underline">
                                    {app.loanAmount
                                        ? `Rp ${Number(app.loanAmount).toLocaleString('id-ID')}`
                                        : '-'}
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {app.tenorMonths ? `${app.tenorMonths} bulan` : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {app.loanPurpose || '-'}
                            </TableCell>
                            <TableCell>
                                <LoanStatusBadge status={app.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {app.createdAt
                                    ? new Date(app.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="space-y-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
    );
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    INTAKE: { label: 'Intake', className: 'bg-slate-100 text-slate-600' },
    SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
    ANALYSIS: { label: 'Analysis', className: 'bg-amber-100 text-amber-700' },
    APPROVED: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600' },
};

function LoanStatusBadge({ status }: { status?: string }) {
    const s = STATUS_MAP[status?.toUpperCase() || ''] || { label: status || '-', className: 'bg-muted text-muted-foreground' };
    return (
        <Badge variant="outline" className={`text-xs font-semibold border ${s.className}`}>
            {s.label}
        </Badge>
    );
}
