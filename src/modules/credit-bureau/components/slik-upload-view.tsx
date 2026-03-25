'use client';

import * as React from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, Files } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { t } from '@/shared/lib/t';

interface FileEntry {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    debtorName?: string;
}

export function SlikUploadView() {
    const [files, setFiles] = React.useState<FileEntry[]>([]);
    const [processing, setProcessing] = React.useState(false);
    const [dragActive, setDragActive] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const addFiles = (newFiles: FileList) => {
        const txtFiles = Array.from(newFiles).filter(f => f.name.endsWith('.txt'));
        const entries: FileEntry[] = txtFiles.map(f => ({
            file: f,
            status: 'pending',
            debtorName: f.name.replace('.txt', '').replace(/^KTP_/, ''),
        }));
        setFiles(prev => [...prev, ...entries]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length) {
            addFiles(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            addFiles(e.target.files);
        }
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadAll = async () => {
        if (files.length === 0) return;
        setProcessing(true);

        for (let i = 0; i < files.length; i++) {
            if (files[i].status !== 'pending') continue;

            setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'uploading' } : f
            ));

            // Mock processing delay per file
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

            setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'success' } : f
            ));
        }

        setProcessing(false);
    };

    const pendingCount = files.filter(f => f.status === 'pending').length;
    const successCount = files.filter(f => f.status === 'success').length;

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-lg font-bold text-foreground">{t`Credit Bureau (SLIK OJK)`}</h1>
                <p className="text-xs text-muted-foreground mt-1">{t`Upload file teks SLIK OJK secara bulk untuk pemrosesan data riwayat kredit debitur`}</p>
            </div>

            <Card>
                <CardContent className="py-5">
                    <div className="space-y-4">
                        {/* Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                dragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".txt"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium text-foreground">
                                    {t`Drag & drop file SLIK (.txt)`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t`Bisa pilih banyak file sekaligus`}
                                </p>
                            </div>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Files className="h-3.5 w-3.5" />
                                        {t`${files.length} file`}
                                        {successCount > 0 && (
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] ml-1">
                                                {t`${successCount} selesai`}
                                            </Badge>
                                        )}
                                    </p>
                                    {pendingCount > 0 && !processing && (
                                        <button
                                            onClick={() => setFiles([])}
                                            className="text-xs text-destructive hover:underline"
                                        >
                                            {t`Hapus semua`}
                                        </button>
                                    )}
                                </div>
                                <div className="border border-border rounded-lg divide-y divide-border max-h-64 overflow-y-auto">
                                    {files.map((entry, i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-foreground truncate">{entry.file.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{(entry.file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            {entry.status === 'pending' && (
                                                <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {entry.status === 'uploading' && (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                            )}
                                            {entry.status === 'success' && (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            )}
                                            {entry.status === 'error' && (
                                                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="text-xs font-bold text-foreground mb-2">{t`Petunjuk:`}</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>{t`1. Login ke sistem SLIK OJK dan lakukan pencarian debitur`}</li>
                                <li>{t`2. Export hasil pencarian dalam format teks (.txt)`}</li>
                                <li>{t`3. Upload satu atau banyak file sekaligus di halaman ini`}</li>
                                <li>{t`4. Sistem akan otomatis memproses dan mencocokkan data ke debitur terkait`}</li>
                            </ul>
                        </div>

                        {/* Upload Button */}
                        {files.length > 0 && pendingCount > 0 && (
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleUploadAll}
                                    disabled={processing}
                                    className="bg-[#1e5adb] hover:bg-[#1e5adb]/90 text-white"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                            {t`Memproses...`}
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-3.5 w-3.5 mr-2" />
                                            {t`Upload ${pendingCount} File`}
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
