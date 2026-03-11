import { SurveyTemplateManagementView } from '@/modules/applicant/components/survey-template-management-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Survey Templates',
};

export default function SurveyTemplatesPage() {
    return (
        <SurveyTemplateManagementView />
    );
}
