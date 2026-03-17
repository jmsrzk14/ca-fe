'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { surveyService } from '@/core/api/services/survey-service';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    ClipboardList,
    User,
    GoalIcon,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    Plus
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { t } from '@/shared/lib/t';
import { useRouter } from 'next/navigation';
import { Survey, SurveyStatus } from '@/shared/types/api';
import { SurveyAssignModal } from './survey-assign-modal';

interface SurveyTabProps {
    applicationId: string;
}

const statusConfig: Record<SurveyStatus, { label: string, color: string, icon: any }> = {
    'UNASSIGNED': { label: 'UNASSIGNED', color: 'bg-slate-500', icon: AlertCircle },
    'ASSIGNED': { label: 'ASSIGNED', color: 'bg-blue-500', icon: User },
    'IN_PROGRESS': { label: 'IN_PROGRESS', color: 'bg-amber-500', icon: Clock },
    'SUBMITTED': { label: 'SUBMITTED', color: 'bg-emerald-500', icon: CheckCircle2 },
    'VERIFIED': { label: 'VERIFIED', color: 'bg-indigo-600', icon: CheckCircle2 },
};

export function SurveyTab({ applicationId }: SurveyTabProps) {
    const router = useRouter();
    const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['surveys', applicationId],
        queryFn: () => surveyService.listByApplication(applicationId),
        enabled: !!applicationId,
    });

    // Fetch survey templates to map name and code
    const { data: templatesData } = useQuery({
        queryKey: ['survey-templates'],
        queryFn: () => surveyService.getTemplates(),
    });

    const templateMap = React.useMemo(() => {
        const map: Record<string, any> = {};
        (templatesData as any)?.templates?.forEach((t: any) => {
            map[t.id] = t;
        });
        return map;
    }, [templatesData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">{t`Memuat data survey...`}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 bg-muted/50 rounded-2xl border border-dashed border-border">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div className="text-center">
                    <h3 className="text-sm font-bold text-foreground">{t`Gagal memuat survey`}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t`Terjadi kesalahan pada sistem.`}</p>
                </div>
            </div>
        );
    }

    const surveys = (data as any)?.surveys || [];

    if (surveys.length === 0) {
        return (
            <>
            <div className="flex flex-col items-center justify-center p-20 gap-4 bg-muted/50 rounded-2xl border border-dashed border-border border-2">
                <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-sm">
                    <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="text-center max-w-xs">
                    <h3 className="text-sm font-bold text-foreground">{t`Belum ada survey`}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-6">
                        {t`Belum ada tugas survey yang dibuat untuk pengajuan ini.`}
                    </p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsAssignModalOpen(true)}
                        className="h-9 gap-2 rounded-full px-6 text-[11px] font-bold uppercase tracking-wider border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors translate-z-0 shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t`Assign Survey Baru`}
                    </Button>
                </div>
            </div>
            
            <SurveyAssignModal 
                applicationId={applicationId} 
                isOpen={isAssignModalOpen} 
                onClose={() => setIsAssignModalOpen(false)} 
            />
        </>
    );
}

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <>
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                    {t`Daftar Survey`}
                </h2>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-full px-4 h-7 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-2">
                        {surveys.length} Survey
                    </Badge>
                    <Button 
                        size="sm" 
                        onClick={() => setIsAssignModalOpen(true)}
                        className="h-8 gap-1 rounded-full px-4 text-[11px] font-bold uppercase tracking-wider"
                    >
                        <Plus className="h-3 w-3" />
                        {t`Assign Survey`}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {surveys.map((survey: Survey) => {
                    const config = statusConfig[survey.status] || statusConfig['UNASSIGNED'];
                    const StatusIcon = config.icon;

                    return (
                        <div
                            key={survey.id}
                            className="bg-card border border-border/50 hover:border-primary/50 cursor-pointer transition-all rounded-2xl p-5 group flex flex-col gap-4 shadow-sm active:scale-[0.98]"
                            onClick={() => router.push(`/loans/${applicationId}/survey/${survey.id}`)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                        survey.status === 'SUBMITTED' || survey.status === 'VERIFIED'
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-indigo-500/10 text-indigo-500'
                                    )}>
                                        <ClipboardList className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-foreground leading-tight">
                                            {templateMap[survey.templateId]?.templateName || survey.surveyType || t`Survey Umum`}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                                            CODE: {templateMap[survey.templateId]?.templateCode || '-'}
                                        </span>
                                    </div>
                                </div>
                                <Badge className={cn(
                                    "border-0 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-none",
                                    config.color
                                )}>
                                    <StatusIcon className="h-3 w-3 mr-1.5 inline-block -mt-0.5" />
                                    {config.label}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t`Tipe`}</span>
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 text-primary" />
                                        <span className="text-xs font-semibold text-foreground truncate">
                                            {survey.surveyType || '-'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t`Tujuan`}</span>
                                    <div className="flex items-center gap-2">
                                        <GoalIcon className="h-3 w-3 text-primary" />
                                        <span className="text-xs font-semibold text-foreground">
                                            {survey.surveyPurpose || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {(survey.totalQuestions !== undefined && survey.totalQuestions > 0) && (
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-1000"
                                        style={{ width: `${(survey.answeredQuestions || 0) / survey.totalQuestions * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
        
        <SurveyAssignModal 
            applicationId={applicationId} 
            isOpen={isAssignModalOpen} 
            onClose={() => setIsAssignModalOpen(false)} 
        />
        </>
    );
}
