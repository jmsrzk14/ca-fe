'use client';

import { useParams } from 'next/navigation';
import { ApplicantEditView } from '@/modules/applicant';

export default function BorrowerEditPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div className="min-h-full">
            <ApplicantEditView id={id} />
        </div>
    );
}
