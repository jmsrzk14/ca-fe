import { ApplicationKanban } from '@/modules/dashboard';
import { Skeleton } from '@/shared/ui/skeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pengajuan',
};

export default function ApplicationsPage() {
    return (
        <div className="w-full h-full">
            <ApplicationKanban />
        </div>
    );
}
