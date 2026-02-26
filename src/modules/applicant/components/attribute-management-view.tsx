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
    // Orang & Identitas
    User, UserCheck, UserX, Users, Baby, PersonStanding, Fingerprint, ScanFace, IdCard,
    // Komunikasi
    Phone, Mail, MessageSquare, Send, AtSign, Bell, Rss, Radio,
    // Pekerjaan & Bisnis
    Building2, Briefcase, Factory, Store, Landmark, Newspaper, ClipboardList, Award, Star,
    // Keuangan
    DollarSign, CreditCard, Banknote, Wallet, PiggyBank, TrendingUp, TrendingDown, BarChart2, Receipt,
    // Kesehatan & Risiko
    Heart, Activity, Shield, Stethoscope, AlertTriangle, ThumbsUp, ThumbsDown,
    // Lokasi & Properti
    MapPin, Globe, Home, Car, Truck, Plane, Anchor, Navigation,
    // Dokumen & Data
    FileText, File, FolderOpen, BookOpen, Link, Hash, Tag, Paperclip,
    // Waktu
    Calendar, Clock, Timer, Hourglass,
    // Lainnya
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

const ICON_OPTIONS = [
    // Orang & Identitas
    { name: 'User', icon: User },
    { name: 'UserCheck', icon: UserCheck },
    { name: 'UserX', icon: UserX },
    { name: 'Users', icon: Users },
    { name: 'Baby', icon: Baby },
    { name: 'PersonStanding', icon: PersonStanding },
    { name: 'Fingerprint', icon: Fingerprint },
    { name: 'ScanFace', icon: ScanFace },
    { name: 'IdCard', icon: IdCard },
    // Komunikasi
    { name: 'Phone', icon: Phone },
    { name: 'Mail', icon: Mail },
    { name: 'MessageSquare', icon: MessageSquare },
    { name: 'Send', icon: Send },
    { name: 'AtSign', icon: AtSign },
    { name: 'Bell', icon: Bell },
    { name: 'Rss', icon: Rss },
    { name: 'Radio', icon: Radio },
    // Pekerjaan & Bisnis
    { name: 'Building', icon: Building2 },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Factory', icon: Factory },
    { name: 'Store', icon: Store },
    { name: 'Landmark', icon: Landmark },
    { name: 'Newspaper', icon: Newspaper },
    { name: 'ClipboardList', icon: ClipboardList },
    { name: 'Award', icon: Award },
    { name: 'Star', icon: Star },
    // Keuangan
    { name: 'DollarSign', icon: DollarSign },
    { name: 'CreditCard', icon: CreditCard },
    { name: 'Banknote', icon: Banknote },
    { name: 'Wallet', icon: Wallet },
    { name: 'PiggyBank', icon: PiggyBank },
    { name: 'TrendingUp', icon: TrendingUp },
    { name: 'TrendingDown', icon: TrendingDown },
    { name: 'BarChart2', icon: BarChart2 },
    { name: 'Receipt', icon: Receipt },
    // Kesehatan & Risiko
    { name: 'Heart', icon: Heart },
    { name: 'Activity', icon: Activity },
    { name: 'Shield', icon: Shield },
    { name: 'Stethoscope', icon: Stethoscope },
    { name: 'AlertTriangle', icon: AlertTriangle },
    { name: 'ThumbsUp', icon: ThumbsUp },
    { name: 'ThumbsDown', icon: ThumbsDown },
    // Lokasi & Properti
    { name: 'MapPin', icon: MapPin },
    { name: 'Globe', icon: Globe },
    { name: 'Home', icon: Home },
    { name: 'Car', icon: Car },
    { name: 'Truck', icon: Truck },
    { name: 'Plane', icon: Plane },
    { name: 'Anchor', icon: Anchor },
    { name: 'Navigation', icon: Navigation },
    // Dokumen & Data
    { name: 'FileText', icon: FileText },
    { name: 'File', icon: File },
    { name: 'FolderOpen', icon: FolderOpen },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Link', icon: Link },
    { name: 'Hash', icon: Hash },
    { name: 'Tag', icon: Tag },
    { name: 'Paperclip', icon: Paperclip },
    // Waktu
    { name: 'Calendar', icon: Calendar },
    { name: 'Clock', icon: Clock },
    { name: 'Timer', icon: Timer },
    { name: 'Hourglass', icon: Hourglass },
    // Lainnya
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
    valueType: 'STRING',
    category: 'LAINNYA',
    isRequired: false,
    uiIcon: 'User',
    uiLabel: '',
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
    return (
        <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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

            <div className="space-y-2 border-l-4 border-orange-500 pl-4 py-1 bg-orange-50/50">
                <Label htmlFor="uiLabel" className="text-orange-700 font-bold">{t`Label di Form (Opsional)`}</Label>
                <Input
                    id="uiLabel"
                    placeholder="Masukkan label cantik untuk user..."
                    value={value.uiLabel}
                    onChange={e => onChange({ uiLabel: e.target.value })}
                />
                <p className="text-[10px] text-orange-600 mt-1 italic">{t`Jika dikosongkan, akan menggunakan Nama Internal.`}</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="uiIcon">{t`Pilih Icon`}</Label>
                <Select
                    value={value.uiIcon}
                    onValueChange={v => onChange({ uiIcon: v })}
                >
                    <SelectTrigger className="h-12 rounded-xl">
                        {(() => {
                            const SelIcon = ICON_MAP[value.uiIcon];
                            return SelIcon ? (
                                <div className="flex items-center gap-2">
                                    <SelIcon className="h-4 w-4 text-orange-600" />
                                    <span>{value.uiIcon}</span>
                                </div>
                            ) : (
                                <SelectValue placeholder={t`Pilih Icon untuk Field`} />
                            );
                        })()}
                    </SelectTrigger>
                    <SelectContent className="max-h-72 overflow-y-auto">
                        <div className="grid grid-cols-6 gap-0.5 p-2">
                            {ICON_OPTIONS.map((opt) => (
                                <SelectItem
                                    key={opt.name}
                                    value={opt.name}
                                    className="flex items-center justify-center p-1.5 rounded-lg hover:bg-orange-50 cursor-pointer data-[state=checked]:bg-orange-100"
                                >
                                    <div className="flex flex-col items-center gap-0.5 min-w-0">
                                        <opt.icon className="h-5 w-5 text-orange-600 shrink-0" />
                                        <span className="text-[7px] uppercase font-bold opacity-40 truncate w-full text-center leading-none">{opt.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </div>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t`Tipe Data`}</Label>
                    <Select
                        value={value.valueType}
                        onValueChange={v => onChange({ valueType: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STRING">TEKS</SelectItem>
                            <SelectItem value="NUMBER">ANGKA</SelectItem>
                            <SelectItem value="DATE">TANGGAL</SelectItem>
                            <SelectItem value="BOOLEAN">PILIHAN (Y/N)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>{t`Kategori`}</Label>
                    <Select
                        value={value.category}
                        onValueChange={v => onChange({ category: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IDENTITAS">IDENTITAS</SelectItem>
                            <SelectItem value="KONTAK">KONTAK</SelectItem>
                            <SelectItem value="PEKERJAAN">PEKERJAAN</SelectItem>
                            <SelectItem value="FINANSIAL">FINANSIAL</SelectItem>
                            <SelectItem value="PERILAKU">PERILAKU</SelectItem>
                            <SelectItem value="LAINNYA">LAINNYA</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="required"
                    checked={value.isRequired}
                    onCheckedChange={(checked: boolean) => onChange({ isRequired: !!checked })}
                />
                <Label htmlFor="required" className="text-sm font-medium leading-none">
                    {t`Field Wajib Diisi`}
                </Label>
            </div>

            <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-orange-600" disabled={isPending}>
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
            attributeCode: attr.attrKey,
            description: attr.attrName || '',
            valueType: attr.dataType || 'STRING',
            category: attr.category || 'LAINNYA',
            isRequired: attr.required ?? false,
            uiIcon: attr.uiIcon || 'User',
            uiLabel: attr.uiLabel || '',
        });
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Settings className="h-8 w-8 text-orange-600" />
                        {t`Manajemen Field Dinamis`}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t`Kelola field kuesioner applicant tanpa menyentuh database.`}
                    </p>
                </div>

                {/* Create Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700 rounded-xl h-12 px-6 gap-2">
                            <Plus className="h-5 w-5" />
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
                            <Pencil className="h-4 w-4 text-orange-600" />
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
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="p-6 border-b bg-muted/20 flex items-center gap-2">
                    <TableIcon className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-bold">{t`Daftar Field Terdaftar (Registry)`}</h2>
                </div>

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
                        <p className="text-muted-foreground font-medium">{t`Menghubungkan ke Registry...`}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                                    <th className="px-6 py-4">{t`ID Field`}</th>
                                    <th className="px-6 py-4">{t`Label & Icon`}</th>
                                    <th className="px-6 py-4">{t`Tipe`}</th>
                                    <th className="px-6 py-4">{t`Kategori`}</th>
                                    <th className="px-6 py-4">{t`Status`}</th>
                                    <th className="px-6 py-4">{t`Aksi`}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {registry?.attributes?.map((attr: any) => {
                                    const IconComp = ICON_MAP[attr.uiIcon] ?? Settings;
                                    return (
                                        <tr key={attr.attrKey} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs">{attr.attrKey}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                        <IconComp className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{attr.uiLabel || attr.attrName}</span>
                                                        <span className="text-[10px] text-muted-foreground italic">{attr.attrName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                                                    {attr.dataType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                    {attr.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {attr.required ? (
                                                    <span className="flex items-center gap-1 text-xs text-orange-600 font-bold">
                                                        <AlertCircle className="h-3 w-3" /> {t`Wajib`}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">{t`Opsional`}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => openEdit(attr)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    {t`Edit`}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
