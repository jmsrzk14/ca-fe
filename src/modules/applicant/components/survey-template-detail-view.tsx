'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surveyService } from '@/core/api';
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
import { SurveySection, SurveyQuestion } from '@/shared/types/api';

const EMPTY_SECTION = {
    sectionName: '',
    sequence: 0,
};

const EMPTY_QUESTION = {
    questionText: '',
    answerType: 'TEXT',
    sequence: 0,
    isRequired: true,
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
    const [addingQuestionToSection, setAddingQuestionToSection] = React.useState<string | null>(null);

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
        mutationFn: ({ sectionId, data }: { sectionId: string; data: typeof EMPTY_QUESTION }) => 
            surveyService.createQuestion(sectionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey-questions'] }); // Invalidate all questions for now, or use specific key if possible
            toast.success(t`Pertanyaan berhasil ditambahkan!`);
            setAddingQuestionToSection(null);
            setNewQuestion({ ...EMPTY_QUESTION });
        },
        onError: (err: any) => toast.error(err.message || t`Gagal menambahkan pertanyaan`),
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
                        <p className="text-xs text-muted-foreground mt-1">
                            {t`Kode`}: <code className="bg-muted px-1 py-0.5 rounded italic">{template?.templateCode}</code>
                        </p>
                    </div>
                </div>

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
