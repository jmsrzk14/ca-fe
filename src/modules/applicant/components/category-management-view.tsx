'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { referenceService } from '@/core/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Plus,
    Table as TableIcon,
    Loader2,
    Pencil,
    User, UserCheck, UserX, Users, Baby, PersonStanding, Fingerprint, ScanFace, IdCard,
    Phone, Mail, MessageSquare, Send, AtSign, Bell, Rss, Radio,
    Building2, Briefcase, Factory, Store, Landmark, Newspaper, ClipboardList, Award, Star,
    DollarSign, CreditCard, Banknote, Wallet, PiggyBank, TrendingUp, TrendingDown, BarChart2, Receipt,
    Heart, Activity, Shield, Stethoscope, AlertTriangle, ThumbsUp, ThumbsDown,
    MapPin, Globe, Home, Car, Truck, Plane, Anchor, Navigation,
    FileText, File, FolderOpen, BookOpen, Link, Hash, Tag, Paperclip,
    Calendar, Clock, Timer, Hourglass,
    Zap, Lock, Key, Eye, Cpu, Wifi, Image, Smile, Settings,
    GraduationCap, Trash2,
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

// Fallback for icons not in the small list but used in the data
const FULL_ICON_MAP: Record<string, React.ElementType> = {
    ...ICON_MAP,
    'id-card': IdCard,
    'users': Users,
    'book': BookOpen,
    'map-pin': MapPin,
    'phone': Phone,
    'home': Home,
    'graduation-cap': GraduationCap,
    'briefcase': Briefcase,
    'store': Store,
    'shield-check': Shield,
    'dollar-sign': DollarSign,
    'credit-card': CreditCard,
    'banknote': Banknote,
    'wallet': Wallet,
    'piggy-bank': PiggyBank,
    'landmark': Landmark,
    'receipt': Receipt,
    'building-2': Building2,
};

const EMPTY_CATEGORY = {
    categoryCode: '',
    categoryName: '',
    uiIcon: 'Settings',
    displayOrder: 0,
    description: '',
};

function CategoryForm({
    value,
    onChange,
    onSubmit,
    isPending,
    isEdit = false,
}: {
    value: typeof EMPTY_CATEGORY;
    onChange: (patch: Partial<typeof EMPTY_CATEGORY>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    isEdit?: boolean;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="categoryCode">{t`Kode Kategori`}</Label>
                    <Input
                        id="categoryCode"
                        value={value.categoryCode}
                        onChange={e => onChange({ categoryCode: e.target.value })}
                        required
                        disabled={isEdit}
                        className={isEdit ? 'opacity-60 cursor-not-allowed' : ''}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="categoryName">{t`Nama Kategori`}</Label>
                    <Input
                        id="categoryName"
                        value={value.categoryName}
                        onChange={e => onChange({ categoryName: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="uiIcon">{t`Icon`}</Label>
                    <Select
                        value={value.uiIcon}
                        onValueChange={v => onChange({ uiIcon: v })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue>
                                {(() => {
                                    const SelIcon = ICON_MAP[value.uiIcon];
                                    return SelIcon ? (
                                        <div className="flex items-center gap-2">
                                            <SelIcon className="h-4 w-4 text-primary" />
                                            <span>{value.uiIcon}</span>
                                        </div>
                                    ) : (
                                        <span>{value.uiIcon || t`Pilih Icon`}</span>
                                    );
                                })()}
                            </SelectValue>
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
                                            <span className="text-[7px] uppercase font-bold opacity-40 truncate w-full text-center leading-none">
                                                {opt.name}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </div>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="displayOrder">{t`Urutan Tampilan`}</Label>
                    <Input
                        id="displayOrder"
                        type="number"
                        value={value.displayOrder}
                        onChange={e => onChange({ displayOrder: Number(e.target.value) })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="description">{t`Deskripsi`}</Label>
                <Input
                    id="description"
                    value={value.description}
                    onChange={e => onChange({ description: e.target.value })}
                />
            </div>

            <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? t`Simpan Perubahan` : t`Simpan Kategori`}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function CategoryManagementView() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [editingCat, setEditingCat] = React.useState<typeof EMPTY_CATEGORY | null>(null);
    const [deletingCat, setDeletingCat] = React.useState<any>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['attribute-categories'],
        queryFn: () => referenceService.listAttributeCategories(),
    });

    const [newCat, setNewCat] = React.useState({ ...EMPTY_CATEGORY });
    const patchNew = (patch: Partial<typeof EMPTY_CATEGORY>) =>
        setNewCat(prev => ({ ...prev, ...patch }));

    const patchEdit = (patch: Partial<typeof EMPTY_CATEGORY>) =>
        setEditingCat(prev => prev ? { ...prev, ...patch } : prev);

    const createMutation = useMutation({
        mutationFn: (data: any) => referenceService.createAttributeCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attribute-categories'] });
            toast.success(t`Kategori baru berhasil ditambahkan!`);
            setIsAddOpen(false);
            setNewCat({ ...EMPTY_CATEGORY });
        },
        onError: (err: any) => toast.error(err.message || t`Gagal menambahkan kategori`),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => referenceService.updateAttributeCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attribute-categories'] });
            toast.success(t`Kategori berhasil diperbarui!`);
            setEditingCat(null);
        },
        onError: (err: any) => toast.error(err.message || t`Gagal memperbarui kategori`),
    });

    const deleteMutation = useMutation({
        mutationFn: (categoryCode: string) => referenceService.deleteAttributeCategory(categoryCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attribute-categories'] });
            toast.success(t`Kategori berhasil dihapus!`);
            setDeletingCat(null);
        },
        onError: (err: any) => toast.error(err.message || t`Gagal menghapus kategori`),
    });

    const handleDelete = (cat: any) => {
        setDeletingCat(cat);
    };

    const confirmDelete = () => {
        if (deletingCat) {
            deleteMutation.mutate(deletingCat.categoryCode);
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newCat);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCat) return;
        updateMutation.mutate(editingCat);
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">{t`Registri Category`}</h1>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-3.5 w-3.5" />
                            {t`Tambah Kategori`}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t`Tambah Kategori Baru`}</DialogTitle>
                            <DialogDescription>
                                {t`Buat kategori baru untuk mengelompokkan field.`}
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm
                            value={newCat}
                            onChange={patchNew}
                            onSubmit={handleCreate}
                            isPending={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={!!editingCat} onOpenChange={(open) => { if (!open) setEditingCat(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-primary" />
                            {t`Edit Kategori`}
                        </DialogTitle>
                        <DialogDescription>
                            {t`Ubah informasi kategori.`}
                        </DialogDescription>
                    </DialogHeader>
                    {editingCat && (
                        <CategoryForm
                            value={editingCat}
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
                        <p className="text-sm text-muted-foreground">{t`Memuat kategori...`}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead>{t`Kategori`}</TableHead>
                                <TableHead>{t`Kode`}</TableHead>
                                <TableHead>{t`Deskripsi`}</TableHead>
                                <TableHead className="text-center w-20">{t`Aksi`}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.categories?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        {t`Belum ada kategori.`}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.categories?.sort((a: any, b: any) => a.displayOrder - b.displayOrder).map((cat: any) => {
                                    const IconComp = FULL_ICON_MAP[cat.uiIcon] || Settings;
                                    return (
                                        <TableRow key={cat.categoryCode} className="group">
                                            <TableCell className="text-center font-medium text-muted-foreground">
                                                {cat.displayOrder}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <IconComp className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="font-semibold">{cat.categoryName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {cat.categoryCode}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                {cat.description}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() => setEditingCat(cat)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDelete(cat)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Dialog open={!!deletingCat} onOpenChange={(open) => { if (!open) setDeletingCat(null); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-2">
                            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <DialogTitle>{t`Konfirmasi Hapus`}</DialogTitle>
                        </div>
                        <DialogDescription className="text-base text-foreground/80">
                            {t`Apakah Anda yakin ingin menghapus kategori`} <span className="font-bold text-foreground">"{deletingCat?.categoryName}"</span>?
                        </DialogDescription>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            {t`Tindakan ini tidak dapat dibatalkan.`}
                        </p>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingCat(null)}
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
                            {t`Ya, Hapus Kategori`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
