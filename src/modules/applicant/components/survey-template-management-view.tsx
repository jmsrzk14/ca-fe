'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surveyService, referenceService } from '@/core/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Plus, Loader2, Pencil, Trash2, AlertTriangle, ClipboardList, Package, User, Eye } from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/shared/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { SurveyTemplate } from '@/shared/types/api';
import { Badge } from '@/shared/ui/badge';

const EMPTY_TEMPLATE = {
    templateName: '',
    templateCode: '',
    applicantType: 'ALL',
    productId: '',
    active: true,
};

function TemplateForm({
    value,
    onChange,
    onSubmit,
    isPending,
    isEdit = false,
}: {
    value: typeof EMPTY_TEMPLATE;
    onChange: (patch: Partial<typeof EMPTY_TEMPLATE>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    isEdit?: boolean;
}) {
    const { data: productsData } = useQuery({
        queryKey: ['loan-products'],
        queryFn: () => referenceService.getLoanProducts(),
    });

    return (
        <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="templateName">{t`Nama Template`}</Label>
                    <Input
                        id="templateName"
                        value={value.templateName}
                        onChange={e => onChange({ templateName: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="templateCode">{t`Kode Template`}</Label>
                    <Input
                        id="templateCode"
                        value={value.templateCode}
                        onChange={e => onChange({ templateCode: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="applicantType">{t`Tipe Pemohon`}</Label>
                    <Select
                        value={value.applicantType}
                        onValueChange={v => onChange({ applicantType: v })}
                    >
                        <SelectTrigger id="applicantType">
                            <SelectValue placeholder="Pilih Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">ALL</SelectItem>
                            <SelectItem value="PERSONAL">PERSONAL</SelectItem>
                            <SelectItem value="COMPANY">COMPANY</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="productId">{t`Target Produk`}</Label>
                    <Select
                        value={value.productId}
                        onValueChange={v => onChange({ productId: v })}
                    >
                        <SelectTrigger id="productId">
                            <SelectValue placeholder="Semua Produk" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">{t`Semua Produk`}</SelectItem>
                            {(productsData as any)?.products?.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.productName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? t`Simpan Perubahan` : t`Simpan Template & Lanjut`}
                </Button>
            </DialogFooter>
        </form>
    );
}

const EMPTY_SECTION = {
    sectionName: '',
    sequence: 0,
};

function SectionForm({
    value,
    onChange,
    onSubmit,
    isPending,
}: {
    value: typeof EMPTY_SECTION;
    onChange: (patch: Partial<typeof EMPTY_SECTION>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="space-y-1.5">
                <Label htmlFor="sectionName">{t`Nama Section`}</Label>
                <Input
                    id="sectionName"
                    value={value.sectionName}
                    onChange={e => onChange({ sectionName: e.target.value })}
                    required
                    placeholder="e.g. Data Peribadi"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="sequence">{t`Urutan (Sequence)`}</Label>
                <Input
                    id="sequence"
                    type="number"
                    value={value.sequence}
                    onChange={e => onChange({ sequence: parseInt(e.target.value) || 0 })}
                    required
                />
            </div>

            <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t`Simpan Section & Lanjut`}
                </Button>
            </DialogFooter>
        </form>
    );
}

const EMPTY_QUESTION = {
    questionText: '',
    answerType: 'TEXT',
    sequence: 0,
    isRequired: true,
};

function QuestionForm({
    value,
    onChange,
    onSubmit,
    isPending,
}: {
    value: typeof EMPTY_QUESTION;
    onChange: (patch: Partial<typeof EMPTY_QUESTION>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="space-y-1.5">
                <Label htmlFor="questionText">{t`Teks Pertanyaan`}</Label>
                <Input
                    id="questionText"
                    value={value.questionText}
                    onChange={e => onChange({ questionText: e.target.value })}
                    required
                    placeholder="e.g. Berapa penghasilan per bulan?"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="answerType">{t`Tipe Jawaban`}</Label>
                    <Select
                        value={value.answerType}
                        onValueChange={v => onChange({ answerType: v })}
                    >
                        <SelectTrigger id="answerType">
                            <SelectValue placeholder="Pilih Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TEXT">TEXT</SelectItem>
                            <SelectItem value="NUMBER">NUMBER</SelectItem>
                            <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                            <SelectItem value="DATE">DATE</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="q-sequence">{t`Urutan (Sequence)`}</Label>
                    <Input
                        id="q-sequence"
                        type="number"
                        value={value.sequence}
                        onChange={e => onChange({ sequence: parseInt(e.target.value) || 0 })}
                        required
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="isRequired"
                    checked={value.isRequired}
                    onChange={e => onChange({ isRequired: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isRequired">{t`Wajib Diisi`}</Label>
            </div>

            <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t`Selesaikan Template`}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function SurveyTemplateManagementView() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [formStep, setFormStep] = React.useState(0);
    const [createdTemplateId, setCreatedTemplateId] = React.useState('');
    const [createdSectionId, setCreatedSectionId] = React.useState('');

    const [editingTemplate, setEditingTemplate] = React.useState<SurveyTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = React.useState<SurveyTemplate | null>(null);

    const { data: templatesData, isLoading } = useQuery({
        queryKey: ['survey-templates'],
        queryFn: () => surveyService.listAdminTemplates(),
    });

    const { data: productsData } = useQuery({
        queryKey: ['loan-products'],
        queryFn: () => referenceService.getLoanProducts(),
    });

    const productMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        (productsData as any)?.products?.forEach((p: any) => {
            map[p.id] = p.productName;
        });
        return map;
    }, [productsData]);

    const [newTemplate, setNewTemplate] = React.useState({ ...EMPTY_TEMPLATE });
    const patchNew = (patch: Partial<typeof EMPTY_TEMPLATE>) =>
        setNewTemplate(prev => ({ ...prev, ...patch }));

    const [newSection, setNewSection] = React.useState({ ...EMPTY_SECTION });
    const patchSection = (patch: Partial<typeof EMPTY_SECTION>) =>
        setNewSection(prev => ({ ...prev, ...patch }));

    const [newQuestion, setNewQuestion] = React.useState({ ...EMPTY_QUESTION });
    const patchQuestion = (patch: Partial<typeof EMPTY_QUESTION>) =>
        setNewQuestion(prev => ({ ...prev, ...patch }));

    const patchEdit = (patch: Partial<typeof EMPTY_TEMPLATE>) =>
        setEditingTemplate(prev => prev ? { ...prev, ...patch } as SurveyTemplate : prev);

    const createMutation = useMutation({
        mutationFn: (data: typeof EMPTY_TEMPLATE) => {
            const payload = { 
                ...data, 
                productId: data.productId === 'ALL' ? '' : data.productId,
                applicantType: data.applicantType === 'ALL' ? '' : data.applicantType,
                active: data.active ?? true
            };
            return surveyService.createTemplate(payload);
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
            toast.success(t`Template berhasil dibuat! Lanjutkan ke buat section.`);
            setCreatedTemplateId(res.id);
            setFormStep(1);
        },
        onError: (err: any) => {
            console.error('Create Error:', err);
            toast.error(err.message || t`Gagal menambahkan template`);
        },
    });

    const createSectionMutation = useMutation({
        mutationFn: (data: typeof EMPTY_SECTION) => {
            return surveyService.createSection(createdTemplateId, data);
        },
        onSuccess: (res) => {
            toast.success(t`Section berhasil dibuat! Lanjutkan ke buat pertanyaan.`);
            setCreatedSectionId(res.id);
            setFormStep(2);
        },
        onError: (err: any) => {
            console.error('Create Section Error:', err);
            toast.error(err.message || t`Gagal menambahkan section`);
        },
    });

    const createQuestionMutation = useMutation({
        mutationFn: (data: typeof EMPTY_QUESTION) => {
            return surveyService.createQuestion(createdSectionId, data);
        },
        onSuccess: () => {
            toast.success(t`Template survey lengkap berhasil dibuat!`);
            setIsAddOpen(false);
            resetForms();
        },
        onError: (err: any) => {
            console.error('Create Question Error:', err);
            toast.error(err.message || t`Gagal menambahkan pertanyaan`);
        },
    });

    const resetForms = () => {
        setFormStep(0);
        setCreatedTemplateId('');
        setCreatedSectionId('');
        setNewTemplate({ ...EMPTY_TEMPLATE });
        setNewSection({ ...EMPTY_SECTION });
        setNewQuestion({ ...EMPTY_QUESTION });
    };

    const updateMutation = useMutation({
        mutationFn: (data: SurveyTemplate) => {
            const payload = { 
                ...data, 
                productId: data.productId === 'ALL' ? '' : data.productId,
                applicantType: data.applicantType === 'ALL' ? '' : data.applicantType,
                active: data.active ?? true,
                templateCode: data.templateCode || '',
                templateName: data.templateName || ''
            };
            return surveyService.updateTemplate(data.id, payload as any);
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
            toast.success(t`Template berhasil diperbarui!`);
            setEditingTemplate(null);
        },
        onError: (err: any) => {
            console.error('Update Error:', err);
            toast.error(err.message || t`Gagal memperbarui template`);
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, active }: { id: string, active: boolean }) => surveyService.updateTemplateStatus(id, active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
            toast.success(t`Status template berhasil diperbarui!`);
            setDeletingTemplate(null);
        },
        onError: (err: any) => toast.error(err.message || t`Gagal memperbarui status template`),
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newTemplate);
    };

    const handleCreateSection = (e: React.FormEvent) => {
        e.preventDefault();
        createSectionMutation.mutate(newSection);
    };

    const handleCreateQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        createQuestionMutation.mutate(newQuestion);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate) return;
        updateMutation.mutate(editingTemplate);
    };

    const confirmDelete = () => {
        if (deletingTemplate) {
            statusMutation.mutate({ id: deletingTemplate.id, active: false });
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">{t`Registri Survey Templates`}</h1>
                    <p className="text-xs text-muted-foreground mt-1">{t`Kelola daftar template survey untuk penilaian kredit.`}</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) resetForms();
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-3.5 w-3.5" />
                            {t`Tambah Template`}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {formStep === 0 && t`Tambah Template Baru`}
                                {formStep === 1 && t`Tambah Section`}
                                {formStep === 2 && t`Tambah Pertanyaan`}
                            </DialogTitle>
                            <DialogDescription>
                                {formStep === 0 && t`Tahap 1: Informasi dasar template survey.`}
                                {formStep === 1 && t`Tahap 2: Tambahkan section untuk template ini.`}
                                {formStep === 2 && t`Tahap 3: Tambahkan pertanyaan untuk section ini.`}
                            </DialogDescription>
                        </DialogHeader>
                        
                        {formStep === 0 && (
                            <TemplateForm
                                value={newTemplate}
                                onChange={patchNew}
                                onSubmit={handleCreate}
                                isPending={createMutation.isPending}
                            />
                        )}

                        {formStep === 1 && (
                            <SectionForm
                                value={newSection}
                                onChange={patchSection}
                                onSubmit={handleCreateSection}
                                isPending={createSectionMutation.isPending}
                            />
                        )}

                        {formStep === 2 && (
                            <QuestionForm
                                value={newQuestion}
                                onChange={patchQuestion}
                                onSubmit={handleCreateQuestion}
                                isPending={createQuestionMutation.isPending}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={!!editingTemplate} onOpenChange={(open) => { if (!open) setEditingTemplate(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-primary" />
                            {t`Edit Template`}
                        </DialogTitle>
                        <DialogDescription>
                            {t`Ubah informasi template survey.`}
                        </DialogDescription>
                    </DialogHeader>
                    {editingTemplate && (
                        <TemplateForm
                            value={{
                                ...EMPTY_TEMPLATE,
                                ...editingTemplate,
                                applicantType: editingTemplate.applicantType || 'ALL',
                                productId: editingTemplate.productId || 'ALL',
                            }}
                            onChange={patchEdit}
                            onSubmit={handleUpdate}
                            isPending={updateMutation.isPending}
                            isEdit
                        />
                    )}
                </DialogContent>
            </Dialog>

            <div className="rounded-xl border bg-card overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{t`Memuat template...`}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t`Nama Survey`}</TableHead>
                                <TableHead>{t`Kode`}</TableHead>
                                <TableHead>{t`Target`}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templatesData?.templates?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        {t`Belum ada template.`}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templatesData?.templates?.map((template: SurveyTemplate) => (
                                    <TableRow key={template.id} className="group transition-colors hover:bg-muted/50">
                                        <TableCell 
                                            className="cursor-pointer hover:text-primary transition-colors py-4 font-medium"
                                            onClick={() => router.push(`/settings/surveys/${template.id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span>{template.templateName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground">
                                                {template.templateCode}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                                        {template.applicantType || 'ALL'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Package className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                        {productMap[template.productId || ''] || t`Semua Produk`}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Dialog open={!!deletingTemplate} onOpenChange={(open) => { if (!open) setDeletingTemplate(null); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-2">
                            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <DialogTitle>{t`Konfirmasi Nonaktifkan`}</DialogTitle>
                        </div>
                        <DialogDescription className="text-base text-foreground/80">
                            {t`Apakah Anda yakin ingin menonaktifkan template`} <span className="font-bold text-foreground">"{deletingTemplate?.templateName}"</span>?
                        </DialogDescription>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            {t`Template ini tidak akan dapat diubah lagi, namun data survey lama tetap tersimpan.`}
                        </p>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingTemplate(null)}
                            disabled={statusMutation.isPending}
                        >
                            {t`Batal`}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={statusMutation.isPending}
                        >
                            {statusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t`Ya, Nonaktifkan`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
