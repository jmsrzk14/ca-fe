'use client';

import * as React from 'react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Eye, Loader2, FileText, ImageIcon, ExternalLink, AlertCircle } from 'lucide-react';
import { mediaService } from '@/core/api/services/media-service';
import { Document } from '@/shared/types/api';
import { t } from '@/shared/lib/t';

interface DocumentCompletenessTabProps {
    applicationId?: string;
}

export function DocumentCompletenessTab({ applicationId }: DocumentCompletenessTabProps) {
    const [documents, setDocuments] = React.useState<Document[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchDocuments = async () => {
            if (!applicationId) return;
            try {
                setLoading(true);
                setError(null);
                const data = await mediaService.listByApplicationId(applicationId);
                setDocuments(data);
            } catch (err) {
                console.error('Failed to fetch documents:', err);
                setError(t`Gagal memuat dokumen. Silakan coba lagi nanti.`);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [applicationId]);

    const isPdf = (doc: Document) => {
        return doc.documentType?.toLowerCase().includes('pdf') || 
               doc.fileUrl?.toLowerCase().endsWith('.pdf');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-70" />
                <p className="text-sm text-muted-foreground animate-pulse">{t`Memuat dokumen...`}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <AlertCircle className="h-10 w-10 text-destructive/70" />
                <p className="text-sm text-destructive font-medium max-w-xs">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    {t`Muat Ulang`}
                </Button>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed rounded-2xl bg-muted/5">
                <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-foreground">{t`Tidak Ada Dokumen`}</p>
                    <p className="text-xs text-muted-foreground">{t`Belum ada dokumen yang diunggah untuk pengajuan ini.`}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-primary/60 rounded-full"></span>
                        {t`Kelengkapan Dokumen`}
                    </h2>
                    <p className="text-[10px] text-muted-foreground ml-3.5 uppercase tracking-wider font-semibold">
                        {documents.length} {t`Ditemukan`}
                    </p>
                </div>
            </div>
            
            <div className="grid gap-3">
                {documents.map((doc) => (
                    <div 
                        key={doc.id} 
                        className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/40 hover:bg-muted/30 transition-all group hover:shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-11 w-11 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105",
                                isPdf(doc) 
                                    ? "bg-rose-500/10 text-rose-600 border border-rose-200/20" 
                                    : "bg-blue-500/10 text-blue-600 border border-blue-200/20"
                            )}>
                                {isPdf(doc) ? (
                                    <FileText className="h-5.5 w-5.5" />
                                ) : (
                                    <ImageIcon className="h-5.5 w-5.5" />
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                    {doc.documentName}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                    <span className="uppercase">{doc.documentType || (isPdf(doc) ? 'PDF' : 'IMG')}</span>
                                    <span>•</span>
                                    <span>
                                        {doc.uploadedAt 
                                            ? new Date(doc.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                            : t`Baru saja`}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">                         
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="h-9 px-4 text-xs font-bold rounded-xl shadow-sm hover:translate-y-[-1px] active:translate-y-0 transition-all bg-white dark:bg-zinc-900 border"
                                    >
                                        <Eye className="h-4 w-4 mr-1.5 text-primary" />
                                        {t`Lihat`}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                                    <DialogHeader className="p-5 border-b bg-background flex flex-row items-center justify-between space-y-0">
                                        <div className="flex items-center gap-3 overflow-hidden mr-8">
                                            <div className={cn(
                                                "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center",
                                                isPdf(doc) ? "bg-rose-500/10 text-rose-600" : "bg-blue-500/10 text-blue-600"
                                            )}>
                                                {isPdf(doc) ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <DialogTitle className="text-base font-bold truncate">
                                                    {doc.documentName}
                                                </DialogTitle>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                                    {isPdf(doc) ? t`Dokumen PDF` : t`Berkas Citra`}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild className="h-9 px-3 shrink-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                <span className="font-bold">{t`Buka Baru`}</span>
                                            </a>
                                        </Button>
                                    </DialogHeader>
                                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative">
                                        {isPdf(doc) ? (
                                            <iframe
                                                src={`${doc.fileUrl}#view=FitH`}
                                                className="w-full h-full border-none bg-white dark:bg-zinc-900"
                                                title={doc.documentName}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-6 sm:p-12 overflow-auto">
                                                <img 
                                                    src={doc.fileUrl} 
                                                    alt={doc.documentName}
                                                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-white dark:bg-zinc-900"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-background border-t flex justify-between items-center px-6">
                                        <p className="text-[10px] text-muted-foreground font-medium">
                                            Dokumen ini dikelola secara aman oleh sistem CA.
                                        </p>
                                        <Badge variant="outline" className="text-[9px] font-bold bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                                            TERVERIFIKASI
                                        </Badge>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/10 flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <AlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-foreground">{t`Catatan Keamanan`}</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Dokumen yang ditampilkan bersifat rahasia. Perubahan atau penghapusan dokumen hanya dapat dilakukan oleh otoritas yang memiliki izin.
                    </p>
                </div>
            </div>
        </div>
    );
}
