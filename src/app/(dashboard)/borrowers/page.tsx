import { ApplicantList } from '@/modules/applicant';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Peminjam',
};

export default function ApplicantsPage() {
    return (
        <ApplicantList />
    );
}

