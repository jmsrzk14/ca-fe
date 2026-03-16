import { SurveyDetailView } from '@/modules/survey/components/survey-detail-view';

export default async function SurveyDetailPage({ params }: { params: Promise<{ id: string; surveyId: string }> }) {
    const { id, surveyId } = await params;
    
    return (
        <div className="p-6">
            <SurveyDetailView applicationId={id} surveyId={surveyId} />
        </div>
    );
}
