import { ApplicantAddView } from '@/modules/applicant';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tambah Peminjam',
};

export default function AddApplicantPage() {
    return (
        <div className="h-full px-6 py-6 overflow-y-auto">
            <ApplicantAddView />
        </div>
    );
}
