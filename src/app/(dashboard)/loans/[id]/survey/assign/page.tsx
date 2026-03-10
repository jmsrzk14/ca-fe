import { Suspense } from 'react';
import { SurveyAssignPage } from '@/modules/dashboard/components/loan-details/survey-assign-page';

export const runtime = 'edge';

export default function Page() {
    return <SurveyAssignPage />;
}
