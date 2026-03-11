import { apiClient } from '../client';
import { SurveyTemplate, Survey, SurveyAnswer, SurveyEvidence } from '@/shared/types/api';

export const surveyService = {
    getTemplates: () =>
        apiClient.get<{ templates: SurveyTemplate[] }>('/v1/survey-templates'),

    createTemplate: (payload: { templateName: string; templateCode: string; applicantType?: string; productId?: string }) =>
        apiClient.post<SurveyTemplate>('/v1/survey-templates', payload),

    updateTemplate: (id: string, payload: { templateName: string; templateCode: string; applicantType?: string; productId?: string }) =>
        apiClient.put<SurveyTemplate>(`/v1/survey-templates/${id}`, payload),

    deleteTemplate: (id: string) =>
        apiClient.delete<void>(`/v1/survey-templates/${id}`),

    assignSurvey: (applicationId: string, payload: { templateId: string, surveyType: string, assignedTo: string, surveyPurpose: string }) =>
        apiClient.post<Survey>(`/v1/applications/${applicationId}/surveys`, payload),

    listByApplication: (applicationId: string) =>
        apiClient.get<{ surveys: Survey[] }>(`/v1/applications/${applicationId}/surveys`),

    updateStatus: (id: string, status: string) =>
        apiClient.patch<Survey>(`/v1/surveys/${id}/status`, { status }),

    submitAnswers: (surveyId: string, answers: SurveyAnswer[]) =>
        apiClient.post<void>(`/v1/surveys/${surveyId}/answers`, { answers }),

    uploadEvidences: (surveyId: string, evidences: SurveyEvidence[]) =>
        apiClient.post<void>(`/v1/surveys/${surveyId}/evidences`, { evidences }),
};
