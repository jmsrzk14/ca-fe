'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { referenceService } from '@/core/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Plus,
    Settings,
    Table as TableIcon,
    Loader2,
    AlertCircle,
    Database,
    Pencil,
    User, UserCheck, UserX, Users, Baby, PersonStanding, Fingerprint, ScanFace, IdCard,
    Phone, Mail, MessageSquare, Send, AtSign, Bell, Rss, Radio,
    Building2, Briefcase, Factory, Store, Landmark, Newspaper, ClipboardList, Award, Star,
    DollarSign, CreditCard, Banknote, Wallet, PiggyBank, TrendingUp, TrendingDown, BarChart2, Receipt,
    Heart, Activity, Shield, Stethoscope, AlertTriangle, ThumbsUp, ThumbsDown,
    MapPin, Globe, Home, Car, Truck, Plane, Anchor, Navigation,
    FileText, File, FolderOpen, BookOpen, Link, Hash, Tag, Paperclip,
    Calendar, Clock, Timer, Hourglass,
    Zap, Lock, Key, Eye, Cpu, Wifi, Image, Smile,
} from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/ui/table';

const ICON_OPTIONS = [
    { name: 'User', icon: User },
    { name: 'UserCheck', icon: UserCheck },
    { name: 'UserX', icon: UserX },
    { name: 'Users', icon: Users },
    { name: 'Baby', icon: Baby },
    { name: 'PersonStanding', icon: PersonStanding },
    { name: 'Fingerprint', icon: Fingerprint },
    { name: 'ScanFace', icon: ScanFace },
    { name: 'IdCard', icon: IdCard },
    { name: 'Phone', icon: Phone },
    { name: 'Mail', icon: Mail },
    { name: 'MessageSquare', icon: MessageSquare },
    { name: 'Send', icon: Send },
    { name: 'AtSign', icon: AtSign },
    { name: 'Bell', icon: Bell },
    { name: 'Rss', icon: Rss },
    { name: 'Radio', icon: Radio },
    { name: 'Building', icon: Building2 },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Factory', icon: Factory },
    { name: 'Store', icon: Store },
    { name: 'Landmark', icon: Landmark },
    { name: 'Newspaper', icon: Newspaper },
    { name: 'ClipboardList', icon: ClipboardList },
    { name: 'Award', icon: Award },
    { name: 'Star', icon: Star },
    { name: 'DollarSign', icon: DollarSign },
    { name: 'CreditCard', icon: CreditCard },
    { name: 'Banknote', icon: Banknote },
    { name: 'Wallet', icon: Wallet },
    { name: 'PiggyBank', icon: PiggyBank },
    { name: 'TrendingUp', icon: TrendingUp },
    { name: 'TrendingDown', icon: TrendingDown },
    { name: 'BarChart2', icon: BarChart2 },
    { name: 'Receipt', icon: Receipt },
    { name: 'Heart', icon: Heart },
    { name: 'Activity', icon: Activity },
    { name: 'Shield', icon: Shield },
    { name: 'Stethoscope', icon: Stethoscope },
    { name: 'AlertTriangle', icon: AlertTriangle },
    { name: 'ThumbsUp', icon: ThumbsUp },
    { name: 'ThumbsDown', icon: ThumbsDown },
    { name: 'MapPin', icon: MapPin },
    { name: 'Globe', icon: Globe },
    { name: 'Home', icon: Home },
    { name: 'Car', icon: Car },
    { name: 'Truck', icon: Truck },
    { name: 'Plane', icon: Plane },
    { name: 'Anchor', icon: Anchor },
    { name: 'Navigation', icon: Navigation },
    { name: 'FileText', icon: FileText },
    { name: 'File', icon: File },
    { name: 'FolderOpen', icon: FolderOpen },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Link', icon: Link },
    { name: 'Hash', icon: Hash },
    { name: 'Tag', icon: Tag },
    { name: 'Paperclip', icon: Paperclip },
    { name: 'Calendar', icon: Calendar },
    { name: 'Clock', icon: Clock },
    { name: 'Timer', icon: Timer },
    { name: 'Hourglass', icon: Hourglass },
    { name: 'Zap', icon: Zap },
    { name: 'Lock', icon: Lock },
    { name: 'Key', icon: Key },
    { name: 'Eye', icon: Eye },
    { name: 'Cpu', icon: Cpu },
    { name: 'Wifi', icon: Wifi },
    { name: 'Image', icon: Image },
    { name: 'Smile', icon: Smile },
    { name: 'Settings', icon: Settings },
] as const;

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
    ICON_OPTIONS.map(o => [o.name, o.icon])
);

const EMPTY_FIELD = {
    attributeCode: '',
    description: '',
    dataType: 'STRING',
    categoryCode: 'LAINNYA',
    categoryName: 'Lainnya',
    categoryIcon: 'User',
    isRequired: false,
    riskRelevant: false,
    appliesTo: 'BOTH',
    scope: 'APPLICANT',
    uiLabel: '',
    choices: [] as { code: string; value: string; displayOrder: number }[],
};

function AttributeForm({
    value,
    onChange,
    onSubmit,
    isPending,
    isEdit = false,
}: {
    value: typeof EMPTY_FIELD;
    onChange: (patch: Partial<typeof EMPTY_FIELD>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    isEdit?: boolean;
}) {
    const handleAddOption = () => {
        const newChoices = [...(value.choices || []), { code: '', value: '', displayOrder: (value.choices?.length || 0) + 1 }];
        onChange({ choices: newChoices });
    };

    const handleOptionChange = (index: number, patch: any) => {
        const newChoices = [...(value.choices || [])];
        newChoices[index] = { ...newChoices[index], ...patch };
        onChange({ choices: newChoices });
    };

    const handleRemoveOption = (index: number) => {
        const newChoices = (value.choices || []).filter((_, i) => i !== index);
        onChange({ choices: newChoices });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="attributeCode">{t`Kode Field`}</Label>
                    <Input
                        id="attributeCode"
                        placeholder="hobi_utama"
                        value={value.attributeCode}
                        onChange={e => onChange({ attributeCode: e.target.value })}
                        required
                        disabled={isEdit}
                        className={isEdit ? 'opacity-60 cursor-not-allowed' : ''}
                    />
                    {isEdit && (
                        <p className="text-[10px] text-muted-foreground italic">{t`Kode tidak bisa diubah.`}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="description">{t`Nama Internal`}</Label>
                    <Input
                        id="description"
                        placeholder="Hobi Utama"
                        value={value.description}
                        onChange={e => onChange({ description: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5 border-l-4 border-primary pl-4 py-1 bg-primary/5 rounded-r-md">
                <Label htmlFor="uiLabel" className="text-primary font-semibold">{t`Label di Form (Opsional)`}</Label>
                <Input
                    id="uiLabel"
                    placeholder="Masukkan label cantik untuk user..."
                    value={value.uiLabel}
                    onChange={e => onChange({ uiLabel: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground italic">{t`Jika dikosongkan, akan menggunakan Nama Internal.`}</p>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="categoryIcon">{t`Pilih Icon Kategori`}</Label>
                <Select
                    value={value.categoryIcon}
                    onValueChange={v => onChange({ categoryIcon: v })}
                >
                    <SelectTrigger>
                        {(() => {
                            const SelIcon = ICON_MAP[value.categoryIcon];
                            return SelIcon ? (
                                <div className="flex items-center gap-2">
                                    <SelIcon className="h-4 w-4 text-primary" />
                                    <span>{value.categoryIcon}</span>
                                </div>
                            ) : (
                                <SelectValue placeholder={t`Pilih Icon untuk Kategori`} />
                            );
                        })()}
                    </SelectTrigger>
                    <SelectContent className="max-h-72 overflow-y-auto">
                        <div className="grid grid-cols-6 gap-0.5 p-2">
                            {ICON_OPTIONS.map((opt) => (
                                <SelectItem
                                    key={opt.name}
                                    value={opt.name}
                                    className="flex items-center justify-center p-1.5 rounded-md hover:bg-muted cursor-pointer data-[state=checked]:bg-primary/10"
                                >
                                    <div className="flex flex-col items-center gap-0.5 min-w-0">
                                        <opt.icon className="h-4 w-4 text-primary shrink-0" />
                                        <span className="text-[7px] uppercase font-bold opacity-40 truncate w-full text-center leading-none">{opt.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </div>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>{t`Tipe Data`}</Label>
                    <Select value={value.dataType} onValueChange={v => onChange({ dataType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STRING">STRING</SelectItem>
                            <SelectItem value="NUMBER">NUMBER</SelectItem>
                            <SelectItem value="DATE">DATE</SelectItem>
                            <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                            <SelectItem value="SELECT">SELECT</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="categoryCode">{t`Kode Kategori`}</Label>
                    <Input
                        id="categoryCode"
                        placeholder="identitas"
                        value={value.categoryCode}
                        onChange={e => onChange({ categoryCode: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="categoryName">{t`Nama Kategori`}</Label>
                    <Input
                        id="categoryName"
                        placeholder="1. Identitas"
                        value={value.categoryName}
                        onChange={e => onChange({ categoryName: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>{t`Applies To`}</Label>
                    <Select value={value.appliesTo} onValueChange={v => onChange({ appliesTo: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PERSONAL">PERSONAL</SelectItem>
                            <SelectItem value="CORPORATE">CORPORATE</SelectItem>
                            <SelectItem value="BOTH">BOTH</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>{t`Scope`}</Label>
                    <Select value={value.scope} onValueChange={v => onChange({ scope: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="APPLICANT">APPLICANT</SelectItem>
                            <SelectItem value="APPLICATION">APPLICATION</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {value.dataType === 'SELECT' && (
                <div className="space-y-3 p-4 border rounded-xl bg-muted/20">
                    <div className="flex items-center justify-between">
                        <Label className="font-semibold">{t`Opsi Pilihan (Select Options)`}</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="h-7 gap-1 text-xs">
                            <Plus className="h-3 w-3" /> {t`Tambah Opsi`}
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {value.choices?.map((opt, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                    <Input
                                        placeholder="Code (e.g. PT)"
                                        value={opt.code}
                                        onChange={e => handleOptionChange(idx, { code: e.target.value })}
                                        className="h-8 text-xs"
                                    />
                                    <Input
                                        placeholder="Value (e.g. Perseroan Terbatas)"
                                        value={opt.value}
                                        onChange={e => handleOptionChange(idx, { value: e.target.value })}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(idx)} className="h-8 w-8 text-destructive">
                                    <Plus className="h-4 w-4 rotate-45" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="required"
                        checked={value.isRequired}
                        onCheckedChange={(checked: boolean) => onChange({ isRequired: !!checked })}
                    />
                    <Label htmlFor="required" className="text-sm font-medium leading-none">
                        {t`Wajib Diisi`}
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="riskRelevant"
                        checked={value.riskRelevant}
                        onCheckedChange={(checked: boolean) => onChange({ riskRelevant: !!checked })}
                    />
                    <Label htmlFor="riskRelevant" className="text-sm font-medium leading-none">
                        {t`Risk Relevant`}
                    </Label>
                </div>
            </div>

            <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? t`Simpan Perubahan` : t`Simpan Konfigurasi`}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function AttributeManagementView() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [editingAttr, setEditingAttr] = React.useState<typeof EMPTY_FIELD | null>(null);

    const { data: registry, isLoading } = useQuery({
        queryKey: ['attribute-registry'],
        queryFn: () => referenceService.getAttributeRegistry(),
    });

    const [newField, setNewField] = React.useState({ ...EMPTY_FIELD });
    const patchNew = (patch: Partial<typeof EMPTY_FIELD>) =>
        setNewField(prev => ({ ...prev, ...patch }));

    const patchEdit = (patch: Partial<typeof EMPTY_FIELD>) =>
        setEditingAttr(prev => prev ? { ...prev, ...patch } : prev);

    const createMutation = useMutation({
        mutationFn: (data: any) => referenceService.createAttributeRegistry(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attribute-registry'] });
            toast.success(t`Field baru berhasil didaftarkan!`);
            setIsAddOpen(false);
            setNewField({ ...EMPTY_FIELD });
        },
        onError: (err: any) => toast.error(err.message || t`Gagal mendaftarkan field`),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => referenceService.updateAttributeRegistry(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attribute-registry'] });
            toast.success(t`Field berhasil diperbarui!`);
            setEditingAttr(null);
        },
        onError: (err: any) => toast.error(err.message || t`Gagal memperbarui field`),
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ ...newField, appliesTo: 'BOTH', scope: 'APPLICANT' });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAttr) return;
        updateMutation.mutate({ ...editingAttr, appliesTo: 'BOTH', scope: 'APPLICANT' });
    };

    const openEdit = (attr: any) => {
        setEditingAttr({
            ...attr,
            choices: attr.choices || [],
        });
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">{t`Manajemen Field Dinamis`}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t`Kelola field kuesioner applicant tanpa menyentuh database.`}
                    </p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-3.5 w-3.5" />
                            {t`Tambah Field Baru`}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t`Daftarkan Field Baru`}</DialogTitle>
                            <DialogDescription>
                                {t`Field ini akan langsung muncul di form Applicant.`}
                            </DialogDescription>
                        </DialogHeader>
                        <AttributeForm
                            value={newField}
                            onChange={patchNew}
                            onSubmit={handleCreate}
                            isPending={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingAttr} onOpenChange={(open) => { if (!open) setEditingAttr(null); }}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-primary" />
                            {t`Edit Field Registry`}
                        </DialogTitle>
                        <DialogDescription>
                            {t`Ubah konfigurasi field. Kode field tidak bisa diubah.`}
                        </DialogDescription>
                    </DialogHeader>
                    {editingAttr && (
                        <AttributeForm
                            value={editingAttr}
                            onChange={patchEdit}
                            onSubmit={handleUpdate}
                            isPending={updateMutation.isPending}
                            isEdit
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{t`Menghubungkan ke Registry...`}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead>{t`Label & Icon`}</TableHead>
                                <TableHead>{t`Tipe`}</TableHead>
                                <TableHead>{t`Kategori`}</TableHead>
                                <TableHead>{t`Status`}</TableHead>
                                <TableHead className="text-center">{t`Aksi`}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registry?.attributes?.map((attr: any) => {
                                const IconComp = ICON_MAP[attr.categoryIcon] ?? Settings;
                                return (
                                    <TableRow key={attr.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                                    <IconComp className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{attr.uiLabel || attr.description}</p>
                                                    <p className="text-[10px] text-muted-foreground">{attr.attributeCode}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                                {attr.dataType}
                                            </Badge>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">{attr.scope}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 border-slate-200">
                                                {attr.categoryName}
                                            </Badge>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{attr.appliesTo}</p>
                                        </TableCell>
                                        <TableCell>
                                            {attr.isRequired ? (
                                                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                                    <AlertCircle className="h-3 w-3" /> {t`Wajib`}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">{t`Opsional`}</span>
                                            )}
                                            {attr.riskRelevant && (
                                                <span className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-0.5">
                                                    <Shield className="h-3 w-3" /> {t`Risk`}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => openEdit(attr)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                                {t`Edit`}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
