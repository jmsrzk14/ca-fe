'use client';

import * as React from 'react';
import { Pencil, ArrowLeft, Loader2, Eye, User } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { surveyService } from '@/core/api';
import { Badge } from '@/shared/ui/badge';
import { t } from '@/shared/lib/t';
import { cn } from '@/shared/lib/utils';
import { SurveyAnswer, SurveyQuestion } from '@/shared/types/api';

interface SurveyDetailViewProps {
    applicationId: string;
    surveyId: string;
}

export function SurveyDetailView({ applicationId, surveyId }: SurveyDetailViewProps) {
    const router = useRouter();
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);

    const { data: survey, isLoading: isSurveyLoading } = useQuery({
        queryKey: ['survey', surveyId],
        queryFn: () => surveyService.getSurvey(surveyId),
    });

    const { data: template, isLoading: isTemplateLoading } = useQuery({
        queryKey: ['survey-template', survey?.templateId],
        queryFn: () => surveyService.getTemplate(survey!.templateId),
        enabled: !!survey?.templateId,
    });

    const { data: answersData, isLoading: isAnswersLoading } = useQuery({
        queryKey: ['survey-answers', surveyId],
        queryFn: () => surveyService.listAnswers(surveyId),
    });

    const { data: sectionsData, isLoading: isSectionsLoading } = useQuery({
        queryKey: ['survey-sections', survey?.templateId],
        queryFn: () => surveyService.listSections(survey!.templateId),
        enabled: !!survey?.templateId,
    });

    const isLoading = isSurveyLoading || isTemplateLoading || isAnswersLoading || isSectionsLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">{t`Memuat detail survey...`}</p>
            </div>
        );
    }

    const answersMap = new Map();
    answersData?.answers?.forEach(ans => {
        answersMap.set(ans.questionId, ans);
    });

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        {t`Kembali`}
                    </Button>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-xl font-bold text-foreground">{template?.templateName || t`Detail Survey`}</h1>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border-emerald-200">
                            {survey?.status}
                        </Badge>
                    </div>
                    {survey && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 font-medium">
                            <span className="flex items-center gap-1.5 text-foreground/80">
                                <User className="h-3 w-3 text-indigo-500" />
                                {survey.applicantName || t`Pemohon`}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase text-slate-600">
                                {survey.surveyType}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="italic opacity-80">
                                {survey.surveyPurpose}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Questions by Section */}
            <div className="space-y-8 pb-10">
                {sectionsData?.sections?.map((section) => (
                    <div key={section.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-indigo-600 font-mono">{section.sequence}</span>
                            </div>
                            <h3 className="text-sm font-bold text-foreground italic">
                                {section.sectionName}
                            </h3>
                        </div>
                        
                        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-border/60">
                                        <TableHead className="w-12 text-center text-[10px] font-bold uppercase tracking-wider">{t`No.`}</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider">{t`Pertanyaan`}</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider">{t`Jawaban`}</TableHead>
                                        <TableHead className="w-32 text-center text-[10px] font-bold uppercase tracking-wider">{t`Tipe`}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {section.questions?.map((q, idx) => {
                                        const answer = answersMap.get(q.id);
                                        return (
                                            <TableRow key={q.id} className="hover:bg-primary/[0.02] transition-colors border-b-border/40 last:border-0">
                                                <TableCell className="text-center text-muted-foreground font-mono text-xs">
                                                    {idx + 1}.
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                                                        {q.questionText}
                                                    </p>
                                                    {q.isRequired && (
                                                        <span className="text-[9px] font-black text-destructive uppercase tracking-tighter mt-1 block">
                                                            * {t`Wajib Diisi`}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {answer ? (
                                                        <div className="flex items-center gap-3">
                                                            {/* 1. Check for Link (answerText) */}
                                                            {answer.answerText && (answer.answerText.startsWith('http://') || answer.answerText.startsWith('https://')) ? (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    className="h-8 gap-2 rounded-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                                                    onClick={() => setPreviewImage(answer.answerText!)}
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    {t`Lihat`}
                                                                </Button>
                                                            ) : (
                                                                /* 2. Check for Boolean (If text and number are empty, and boolean exists) */
                                                                (!answer.answerText && !answer.answerNumber && answer.answerBoolean !== undefined && answer.answerBoolean !== null)
                                                            ) ? (
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={cn(
                                                                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase",
                                                                        answer.answerBoolean ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                                                                    )}
                                                                >
                                                                    {answer.answerBoolean ? t`Ya` : t`Tidak`}
                                                                </Badge>
                                                            ) : (
                                                                /* 3. Fallback to other values */
                                                                <span className="text-sm font-medium text-foreground">
                                                                    {answer.answerText || answer.answerNumber || (answer.answerDate && answer.answerDate !== "0001-01-01T00:00:00Z" ? new Date(answer.answerDate).toLocaleDateString('id-ID') : '—')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-muted-foreground/60 italic font-medium">{t`Belum dijawab`}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="text-[9px] font-black uppercase px-2 py-0 border-none bg-slate-100 text-slate-600">
                                                        {q.answerType}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {(!section.questions || section.questions.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <p className="text-xs italic">{t`Tidak ada pertanyaan dalam section ini.`}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ))}

                {(!sectionsData?.sections || sectionsData.sections.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                        <p className="text-sm text-muted-foreground font-medium italic">{t`Template ini belum memiliki section.`}</p>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-4xl p-1 overflow-hidden border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:hover:bg-black/70 [&>button]:rounded-full [&>button]:h-8 [&>button]:w-8 [&>button]:top-4 [&>button]:right-4">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{t`Preview Gambar`}</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full h-[80vh] flex items-center justify-center p-4">
                        {previewImage && (
                            <img 
                                src={previewImage} 
                                alt="Survey Evidence" 
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
