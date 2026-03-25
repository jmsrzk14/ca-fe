'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surveyService, referenceService } from '@/core/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { 
    Plus, 
    Loader2, 
    ArrowLeft, 
    LayoutDashboard, 
    ClipboardList,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Pencil,
    Trash2
} from 'lucide-react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { SurveySection, SurveyQuestion, SurveyTemplate } from '@/shared/types/api';

const EMPTY_TEMPLATE = {
    templateName: '',
    templateCode: '',
    applicantType: 'ALL',
    productId: '',
    active: true,
};

const EMPTY_SECTION = {
    sectionName: '',
    sequence: 0,
};

const EMPTY_QUESTION = {
    questionText: '',
    answerType: 'TEXT',
    sequence: 0,
    isRequired: true,
    options: [] as { optionText: string; optionValue: string }[],
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
                            <SelectValue placeholder={t`Pilih Tipe`} />
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
                            <SelectValue placeholder={t`Semua Produk`} />
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
                    {t`Tambah Section`}
                </Button>
            </DialogFooter>
        </form>
    );
}

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
    const addOption = () => {
        const currentOptions = value.options || [];
        onChange({ options: [...currentOptions, { optionText: '', optionValue: '' }] });
    };

    const removeOption = (index: number) => {
        const currentOptions = value.options || [];
        onChange({ options: currentOptions.filter((_, i) => i !== index) });
    };

    const updateOption = (index: number, patch: Partial<{ optionText: string; optionValue: string }>) => {
        const currentOptions = value.options || [];
        const newOptions = [...currentOptions];
        newOptions[index] = { ...newOptions[index], ...patch };
        onChange({ options: newOptions });
    };

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
                            <SelectValue placeholder={t`Pilih Tipe`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TEXT">TEXT</SelectItem>
                            <SelectItem value="NUMBER">NUMBER</SelectItem>
                            <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                            <SelectItem value="DATE">DATE</SelectItem>
                            <SelectItem value="SELECT">SELECT</SelectItem>
                            <SelectItem value="IMAGE">IMAGE</SelectItem>
                            <SelectItem value="LOCATION">LOCATION</SelectItem>
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

            {value.answerType === 'SELECT' && (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t`Opsi Jawaban`}</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-7 text-[10px]">
                            <Plus className="h-3 w-3 mr-1" />
                            {t`Tambah Opsi`}
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                        {value.options?.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <Input 
                                    placeholder={t`Teks Opsi`} 
                                    value={opt.optionText} 
                                    onChange={e => updateOption(idx, { optionText: e.target.value })}
                                    className="h-8 text-xs"
                                    required
                                />
                                <Input 
                                    placeholder={t`Value`} 
                                    value={opt.optionValue} 
                                    onChange={e => updateOption(idx, { optionValue: e.target.value })}
                                    className="h-8 text-xs font-mono"
                                    required
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeOption(idx)}
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                        {value.options?.length === 0 && (
                            <p className="text-[10px] text-muted-foreground italic text-center py-2">{t`Belum ada opsi. Silakan tambah minimal satu.`}</p>
                        )}
                    </div>
                </div>
            )}

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
                    {t`Tambah Pertanyaan`}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function SurveyTemplateDetailView({ templateId }: { templateId: string }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isAddSectionOpen, setIsAddSectionOpen] = React.useState(false);
    const [isEditTemplateOpen, setIsEditTemplateOpen] = React.useState(false);
    const [isDeleteTemplateOpen, setIsDeleteTemplateOpen] = React.useState(false);
    const [addingQuestionToSection, setAddingQuestionToSection] = React.useState<string | null>(null);

    const [editingTemplate, setEditingTemplate] = React.useState<typeof EMPTY_TEMPLATE>({ ...EMPTY_TEMPLATE });
    const patchEditTemplate = (patch: Partial<typeof EMPTY_TEMPLATE>) =>
        setEditingTemplate(prev => ({ ...prev, ...patch }));

    const [newSection, setNewSection] = React.useState({ ...EMPTY_SECTION });
    const patchSection = (patch: Partial<typeof EMPTY_SECTION>) =>
        setNewSection(prev => ({ ...prev, ...patch }));

    const [newQuestion, setNewQuestion] = React.useState({ ...EMPTY_QUESTION });
    const patchQuestion = (patch: Partial<typeof EMPTY_QUESTION>) =>
        setNewQuestion(prev => ({ ...prev, ...patch }));

    const { data: template, isLoading: isTemplateLoading } = useQuery({
        queryKey: ['survey-template', templateId],
        queryFn: () => surveyService.getTemplate(templateId),
    });

    React.useEffect(() => {
        if (template) {
            setEditingTemplate({
                templateName: template.templateName || '',
                templateCode: template.templateCode || '',
                applicantType: template.applicantType || 'ALL',
                productId: template.productId || 'ALL',
                active: template.active ?? true,
            });
        }
    }, [template]);

    const { data: sectionsData, isLoading: isSectionsLoading } = useQuery({
        queryKey: ['survey-sections', templateId],
        queryFn: () => surveyService.listSections(templateId),
    });

    const createSectionMutation = useMutation({
        mutationFn: (data: typeof EMPTY_SECTION) => surveyService.createSection(templateId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey-sections', templateId] });
            toast.success(t`Section berhasil ditambahkan!`);
            setIsAddSectionOpen(false);
            setNewSection({ ...EMPTY_SECTION });
        },
        onError: (err: any) => toast.error(err.message || t`Gagal menambahkan section`),
    });

    const createQuestionMutation = useMutation({
        mutationFn: async ({ sectionId, data }: { sectionId: string; data: typeof EMPTY_QUESTION }) => {
            const { options, ...questionData } = data;
            const question = await surveyService.createQuestion(sectionId, questionData);
            
            if (data.answerType === 'SELECT' && options && options.length > 0) {
                await Promise.all(
                    options.map(opt => surveyService.createQuestionOption(question.id, opt))
                );
            }
            
            return question;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey-questions'] }); // Invalidate all questions for now, or use specific key if possible
            toast.success(t`Pertanyaan berhasil ditambahkan!`);
            setAddingQuestionToSection(null);
            setNewQuestion({ ...EMPTY_QUESTION });
        },
        onError: (err: any) => toast.error(err.message || t`Gagal menambahkan pertanyaan`),
    });

    const updateTemplateMutation = useMutation({
        mutationFn: (data: typeof EMPTY_TEMPLATE) => {
            const payload = { 
                ...data, 
                productId: data.productId === 'ALL' ? '' : data.productId,
                applicantType: data.applicantType === 'ALL' ? '' : data.applicantType,
                active: data.active ?? true
            };
            return surveyService.updateTemplate(templateId, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey-template', templateId] });
            queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
            toast.success(t`Template berhasil diperbarui!`);
            setIsEditTemplateOpen(false);
        },
        onError: (err: any) => toast.error(err.message || t`Gagal memperbarui template`),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (active: boolean) => surveyService.updateTemplateStatus(templateId, active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey-template', templateId] });
            queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
            toast.success(t`Status template berhasil diperbarui!`);
        },
        onError: (err: any) => toast.error(err.message || t`Gagal memperbarui status template`),
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: () => surveyService.updateTemplateStatus(templateId, false), // Using status update as a soft delete / deactivation
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
            toast.success(t`Template berhasil dinonaktifkan!`);
            router.push('/settings/surveys');
        },
        onError: (err: any) => toast.error(err.message || t`Gagal menonaktifkan template`),
    });

    const handleCreateSection = (e: React.FormEvent) => {
        e.preventDefault();
        createSectionMutation.mutate(newSection);
    };

    const handleCreateQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (addingQuestionToSection) {
            createQuestionMutation.mutate({ sectionId: addingQuestionToSection, data: newQuestion });
        }
    };

    const handleUpdateTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        updateTemplateMutation.mutate(editingTemplate);
    };

    if (isTemplateLoading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t`Memuat informasi template...`}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{template?.templateName}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground italic">
                                {template?.templateCode}
                            </code>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <Badge 
                                className={template?.active 
                                    ? "bg-emerald-500/10 text-emerald-500 border-none cursor-pointer hover:bg-emerald-500/20 active:scale-95 transition-all" 
                                    : "bg-muted text-muted-foreground border-none cursor-pointer hover:bg-muted/80 active:scale-95 transition-all"
                                }
                                onClick={() => updateStatusMutation.mutate(!template?.active)}
                                title={template?.active ? t`Klik untuk Nonaktifkan` : t`Klik untuk Aktifkan`}
                            >
                                {updateStatusMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    template?.active ? t`Aktif` : t`Non-Aktif`
                                )}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditTemplateOpen(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        {t`Edit`}
                    </Button>
                    <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-3.5 w-3.5" />
                                {t`Tambah Section`}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{t`Tambah Section Baru`}</DialogTitle>
                                <DialogDescription>
                                    {t`Buat kategori pertanyaan baru untuk template ini.`}
                                </DialogDescription>
                            </DialogHeader>
                            <SectionForm
                                value={newSection}
                                onChange={patchSection}
                                onSubmit={handleCreateSection}
                                isPending={createSectionMutation.isPending}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                {isSectionsLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 bg-card rounded-xl border border-dashed">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{t`Memuat section...`}</p>
                    </div>
                ) : sectionsData?.sections?.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 bg-card rounded-xl border border-dashed">
                        <LayoutDashboard className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">{t`Belum ada section dalam template ini.`}</p>
                        <Button variant="outline" size="sm" onClick={() => setIsAddSectionOpen(true)}>
                            {t`Mulai Tambah Section`}
                        </Button>
                    </div>
                ) : (
                    sectionsData?.sections?.map((section: SurveySection) => (
                        <SectionCard 
                            key={section.id} 
                            section={section} 
                            onAddQuestion={() => setAddingQuestionToSection(section.id)}
                        />
                    ))
                )}
            </div>

            <Dialog open={!!addingQuestionToSection} onOpenChange={(open) => !open && setAddingQuestionToSection(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t`Tambah Pertanyaan`}</DialogTitle>
                        <DialogDescription>
                            {t`Tambahkan pertanyaan baru ke dalam section ini.`}
                        </DialogDescription>
                    </DialogHeader>
                    <QuestionForm
                        value={newQuestion}
                        onChange={patchQuestion}
                        onSubmit={handleCreateQuestion}
                        isPending={createQuestionMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t`Edit Template`}</DialogTitle>
                        <DialogDescription>
                            {t`Ubah informasi dasar template survey.`}
                        </DialogDescription>
                    </DialogHeader>
                    <TemplateForm
                        value={editingTemplate}
                        onChange={patchEditTemplate}
                        onSubmit={handleUpdateTemplate}
                        isPending={updateTemplateMutation.isPending}
                        isEdit
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteTemplateOpen} onOpenChange={setIsDeleteTemplateOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-destructive mb-2">
                            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <DialogTitle>{t`Nonaktifkan Template`}</DialogTitle>
                        </div>
                        <DialogDescription className="text-base text-foreground/80">
                            {t`Apakah Anda yakin ingin menonaktifkan template ini?`}
                        </DialogDescription>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            {t`Template ini tidak akan dapat diubah lagi, namun data survey lama tetap tersimpan.`}
                        </p>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteTemplateOpen(false)}>{t`Batal`}</Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => deleteTemplateMutation.mutate()}
                            disabled={deleteTemplateMutation.isPending}
                        >
                            {deleteTemplateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t`Ya, Nonaktifkan`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SectionCard({ section, onAddQuestion }: { section: SurveySection, onAddQuestion: () => void }) {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const { data: questionsData, isLoading } = useQuery({
        queryKey: ['survey-questions', section.id],
        queryFn: () => surveyService.listQuestions(section.id),
        enabled: isExpanded
    });

    return (
        <Card className="overflow-hidden border-border/50 shadow-none">
            <CardHeader 
                className="p-4 bg-muted/5 flex flex-row items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center rounded-full font-bold bg-background">
                        {section.sequence}
                    </Badge>
                    <CardTitle className="text-sm font-bold">{section.sectionName}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddQuestion();
                        }}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="p-0 border-t border-border/50">
                    {isLoading ? (
                        <div className="p-6 flex justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : questionsData?.questions?.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground italic">
                            {t`Belum ada pertanyaan.`}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {questionsData?.questions?.map((q: SurveyQuestion) => (
                                <div key={q.id} className="p-4 flex items-center justify-between group hover:bg-primary/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-6 text-center">{q.sequence}.</span>
                                        <div>
                                            <p className="text-sm font-medium">{q.questionText}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[9px] font-black uppercase px-1.5 py-0">
                                                    {q.answerType}
                                                </Badge>
                                                {q.isRequired && (
                                                    <span className="text-[10px] text-destructive font-bold uppercase">{t`Wajib`}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                            <MoreVertical className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
