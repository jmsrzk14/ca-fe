'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surveyService, referenceService } from '@/core/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Plus, Loader2, Pencil, Trash2, AlertTriangle, ClipboardList, Package, User } from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
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
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                    {isEdit ? t`Simpan Perubahan` : t`Simpan Template`}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function SurveyTemplateManagementView() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [editingTemplate, setEditingTemplate] = React.useState<SurveyTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = React.useState<SurveyTemplate | null>(null);

    const { data: templatesData, isLoading } = useQuery({
        queryKey: ['survey-templates'],
        queryFn: () => surveyService.getTemplates(),
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

    const patchEdit = (patch: Partial<typeof EMPTY_TEMPLATE>) =>
        setEditingTemplate(prev => prev ? { ...prev, ...patch } as SurveyTemplate : prev);

    const createMutation = useMutation({
        mutationFn: (data: typeof EMPTY_TEMPLATE) => {
            const payload = { 
                ...data, 
                productId: data.productId === 'ALL' ? '' : data.productId,
                applicantType: data.applicantType === 'ALL' ? '' : data.applicantType
            };
            return surveyService.createTemplate(payload);
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
            toast.success(t`Template baru berhasil ditambahkan!`);
            setIsAddOpen(false);
            setNewTemplate({ ...EMPTY_TEMPLATE });
        },
        onError: (err: any) => {
            console.error('Create Error:', err);
            toast.error(err.message || t`Gagal menambahkan template`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: SurveyTemplate) => {
            const payload = { 
                ...data, 
                productId: data.productId === 'ALL' ? '' : data.productId,
                applicantType: data.applicantType === 'ALL' ? '' : data.applicantType
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

    const deleteMutation = useMutation({
        mutationFn: (id: string) => surveyService.deleteTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
            toast.success(t`Template berhasil dihapus!`);
            setDeletingTemplate(null);
        },
        onError: (err: any) => toast.error(err.message || t`Gagal menghapus template`),
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newTemplate);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate) return;
        updateMutation.mutate(editingTemplate);
    };

    const confirmDelete = () => {
        if (deletingTemplate) {
            deleteMutation.mutate(deletingTemplate.id);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">{t`Registri Survey Templates`}</h1>
                    <p className="text-xs text-muted-foreground mt-1">{t`Kelola daftar template survey untuk penilaian kredit.`}</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-3.5 w-3.5" />
                            {t`Tambah Template`}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t`Tambah Template Baru`}</DialogTitle>
                            <DialogDescription>
                                {t`Buat template survey baru.`}
                            </DialogDescription>
                        </DialogHeader>
                        <TemplateForm
                            value={newTemplate}
                            onChange={patchNew}
                            onSubmit={handleCreate}
                            isPending={createMutation.isPending}
                        />
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
                                <TableHead className="text-center w-20"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templatesData?.templates?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        {t`Belum ada template.`}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templatesData?.templates?.map((template: SurveyTemplate) => (
                                    <TableRow key={template.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold">{template.templateName}</span>
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
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => setEditingTemplate(template)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => setDeletingTemplate(template)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
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
                            <DialogTitle>{t`Konfirmasi Hapus`}</DialogTitle>
                        </div>
                        <DialogDescription className="text-base text-foreground/80">
                            {t`Apakah Anda yakin ingin menghapus template`} <span className="font-bold text-foreground">"{deletingTemplate?.templateName}"</span>?
                        </DialogDescription>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            {t`Tindakan ini tidak dapat dibatalkan.`}
                        </p>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingTemplate(null)}
                            disabled={deleteMutation.isPending}
                        >
                            {t`Batal`}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t`Ya, Hapus Template`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
