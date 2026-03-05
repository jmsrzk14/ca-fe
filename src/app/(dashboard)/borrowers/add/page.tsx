import { ApplicantAddView } from '@/modules/applicant';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tambah Peminjam',
};

export default function AddApplicantPage() {
    return (
        <ApplicantAddView />
    );
}
