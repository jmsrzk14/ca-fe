import { SurveyTemplateDetailView } from '@/modules/applicant/components/survey-template-detail-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Survey Template Detail',
};

export default async function SurveyTemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    return (
        <SurveyTemplateDetailView templateId={id} />
    );
}
