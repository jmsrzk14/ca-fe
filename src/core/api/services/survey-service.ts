import { apiClient } from '../client';
import { SurveyTemplate, Survey, SurveyAnswer, SurveyEvidence, SurveySection, SurveyQuestion, SurveyQuestionOption } from '@/shared/types/api';

export const surveyService = {
    // TEMPLATES (USER)
    getTemplates: () =>
        apiClient.get<{ templates: SurveyTemplate[] }>('/v1/survey-templates'),

    getTemplate: (id: string) =>
        apiClient.get<SurveyTemplate>(`/v1/survey-templates/${id}`),

    // TEMPLATES (ADMIN)
    listAdminTemplates: () =>
        apiClient.get<{ templates: SurveyTemplate[] }>('/v1/admin/survey-templates'),

    createTemplate: (payload: { templateName: string; templateCode: string; description?: string; applicantType?: string; productId?: string; active?: boolean }) =>
        apiClient.post<SurveyTemplate>('/v1/admin/survey-templates', payload),

    updateTemplate: (id: string, payload: { templateName: string; templateCode: string; description?: string; applicantType?: string; productId?: string; active?: boolean }) =>
        apiClient.put<SurveyTemplate>(`/v1/admin/survey-templates/${id}`, payload),

    updateTemplateStatus: (id: string, active: boolean) =>
        apiClient.patch<SurveyTemplate>(`/v1/admin/survey-templates/${id}/status`, { id, active }),

    // SECTIONS & QUESTIONS
    listSections: (templateId: string) =>
        apiClient.get<{ sections: SurveySection[] }>(`/v1/survey-templates/${templateId}/sections`),

    createSection: (templateId: string, payload: { sectionName: string; sequence: number }) =>
        apiClient.post<SurveySection>(`/v1/survey-templates/${templateId}/sections`, payload),

    listQuestions: (sectionId: string) =>
        apiClient.get<{ questions: SurveyQuestion[] }>(`/v1/sections/${sectionId}/questions`),

    createQuestion: (sectionId: string, payload: { questionText: string; answerType: string; sequence: number; isRequired: boolean }) =>
        apiClient.post<SurveyQuestion>(`/v1/sections/${sectionId}/questions`, payload),

    createQuestionOption: (questionId: string, payload: { optionText: string; optionValue: string }) =>
        apiClient.post<SurveyQuestionOption>(`/v1/questions/${questionId}/options`, payload),

    // APPLICATION SURVEYS
    assignSurvey: (applicationId: string, payload: { templateId: string, surveyType: string, assignedTo: string, surveyPurpose: string }) =>
        apiClient.post<Survey>(`/v1/applications/${applicationId}/surveys`, payload),

    getSurvey: (id: string) =>
        apiClient.get<Survey>(`/v1/surveys/${id}`),

    listByApplication: (applicationId: string) =>
        apiClient.get<{ surveys: Survey[] }>(`/v1/applications/${applicationId}/surveys`),

    listSurveys: (params?: { status?: string; applicationId?: string; assignedTo?: string; surveyType?: string; pageSize?: number; cursor?: string }) => {
        const queryParams: Record<string, string> = {};
        if (params) {
            if (params.status) queryParams.status = params.status;
            if (params.applicationId) queryParams.applicationId = params.applicationId;
            if (params.assignedTo) queryParams.assignedTo = params.assignedTo;
            if (params.surveyType) queryParams.surveyType = params.surveyType;
            if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
            if (params.cursor) queryParams.cursor = params.cursor;
        }
        return apiClient.get<{ surveys: Survey[]; nextCursor: string; hasNext: boolean }>('/v1/surveys', { params: queryParams });
    },

    // WORKFLOW
    startSurvey: (id: string) =>
        apiClient.put<Survey>(`/v1/surveys/${id}/start`, {}),

    submitSurvey: (id: string) =>
        apiClient.put<Survey>(`/v1/surveys/${id}/submit`, {}),

    verifySurvey: (id: string) =>
        apiClient.put<Survey>(`/v1/surveys/${id}/verify`, {}),

    // ANSWERS & EVIDENCE
    listAnswers: (surveyId: string) =>
        apiClient.get<{ answers: SurveyAnswer[] }>(`/v1/surveys/${surveyId}/answers`),

    submitAnswer: (surveyId: string, questionId: string, payload: Partial<SurveyAnswer>) =>
        apiClient.post<SurveyAnswer>(`/v1/surveys/${surveyId}/answers`, { ...payload, questionId }),

    uploadEvidence: (surveyId: string, payload: { evidenceType: string; fileUrl: string; description: string }) =>
        apiClient.post<SurveyEvidence>(`/v1/surveys/${surveyId}/evidences`, payload),
};
