import { apiClient } from '../client';
import { SurveyTemplate, Survey, SurveyAnswer, SurveyEvidence } from '@/shared/types/api';

export const surveyService = {
    getTemplates: () =>
        apiClient.get<{ templates: SurveyTemplate[] }>('/v1/survey-templates'),

    assignSurvey: (applicationId: string, templateId: string, surveyPurpose: string = '') =>
        apiClient.post<Survey>(`/v1/applications/${applicationId}/surveys`, {
            templateId,
            surveyPurpose,
            surveyType: 'GENERAL', // Default type
            assignedTo: '' // Optional for now
        }),

    listByApplication: (applicationId: string) =>
        apiClient.get<{ surveys: Survey[] }>(`/v1/applications/${applicationId}/surveys`),

    updateStatus: (id: string, status: string) =>
        apiClient.patch<Survey>(`/v1/surveys/${id}/status`, { status }),

    submitAnswers: (surveyId: string, answers: SurveyAnswer[]) =>
        apiClient.post<void>(`/v1/surveys/${surveyId}/answers`, { answers }),

    uploadEvidences: (surveyId: string, evidences: SurveyEvidence[]) =>
        apiClient.post<void>(`/v1/surveys/${surveyId}/evidences`, { evidences }),
};
