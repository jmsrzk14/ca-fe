import { apiClient } from '../client';
import { SurveyTemplate, Survey, SurveyAnswer, SurveyEvidence } from '@/shared/types/api';

export const surveyService = {
    getTemplates: () =>
        apiClient.get<SurveyTemplate[]>('/v1/surveys/templates'),

    assignSurvey: (applicationId: string, surveyData: Partial<Survey>) =>
        apiClient.post<Survey>(`/v1/applications/${applicationId}/surveys`, surveyData),

    updateStatus: (id: string, status: string) =>
        apiClient.patch<Survey>(`/v1/surveys/${id}/status`, { status }),

    submitAnswers: (surveyId: string, answers: SurveyAnswer[]) =>
        apiClient.post<void>(`/v1/surveys/${surveyId}/answers`, { answers }),

    uploadEvidences: (surveyId: string, evidences: SurveyEvidence[]) =>
        apiClient.post<void>(`/v1/surveys/${surveyId}/evidences`, { evidences }),
};
