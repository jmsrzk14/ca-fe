'use client';

import { useParams } from 'next/navigation';
import { ApplicantDetail } from '@/modules/applicant';

export default function ApplicantDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <ApplicantDetail id={id} />
    );
}
