import { ApplicationAddPage } from '@/modules/applicant';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Buat Pengajuan Pinjaman',
};

export default function LoanApplicationAddPage() {
    return (
        <div className="h-full px-6 py-6 overflow-y-auto">
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <ApplicationAddPage redirectTo="/loans" />
            </Suspense>
        </div>
    );
}
