import { ApplicantList } from '@/modules/applicant';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Peminjam',
};

export default function ApplicantsPage() {
    return (
        <div className="h-full px-6 py-6">
            <ApplicantList />
        </div>
    );
}

