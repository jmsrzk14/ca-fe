import { apiClient } from '../client';
import {
    SurveyTemplate,
    SurveySection,
    SurveyQuestion,
    SurveyQuestionOption,
    Survey,
    SurveyAnswer,
    SurveyEvidence,
    OrderItem,
} from '@/shared/types/api';


// ============================================================
// DUMMY DATA — aligned with proto: survey.proto messages
// ============================================================
const USE_DUMMY_DATA = false;

// proto: SurveyQuestionOption
const REASON_OPTIONS: SurveyQuestionOption[] = [
    { id: "opt-001", questionId: "q-003", optionText: "Sangat Baik",  optionValue: "EXCELLENT" },
    { id: "opt-002", questionId: "q-003", optionText: "Baik",         optionValue: "GOOD" },
    { id: "opt-003", questionId: "q-003", optionText: "Cukup",        optionValue: "FAIR" },
    { id: "opt-004", questionId: "q-003", optionText: "Buruk",        optionValue: "POOR" },
];

// proto: SurveyQuestion
const QUESTIONS_SEC1: SurveyQuestion[] = [
    { id: "q-001", sectionId: "sec-001", questionText: "Apakah lokasi usaha dapat diverifikasi?", answerType: "BOOLEAN", sequence: 1, isRequired: true,  options: [] },
    { id: "q-002", sectionId: "sec-001", questionText: "Alamat lengkap tempat usaha",              answerType: "TEXT",    sequence: 2, isRequired: true,  options: [] },
    { id: "q-003", sectionId: "sec-001", questionText: "Kondisi tempat usaha",                    answerType: "OPTION",  sequence: 3, isRequired: true,  options: REASON_OPTIONS },
    { id: "q-004", sectionId: "sec-001", questionText: "Foto tempat usaha",                       answerType: "IMAGE",   sequence: 4, isRequired: false, options: [] },
];

const QUESTIONS_SEC2: SurveyQuestion[] = [
    { id: "q-005", sectionId: "sec-002", questionText: "Omset bulanan rata-rata (Rp)",            answerType: "NUMBER",  sequence: 1, isRequired: true,  options: [] },
    { id: "q-006", sectionId: "sec-002", questionText: "Apakah debitur memiliki pembukuan?",      answerType: "BOOLEAN", sequence: 2, isRequired: true,  options: [] },
    { id: "q-007", sectionId: "sec-002", questionText: "Foto pembukuan / catatan keuangan",        answerType: "IMAGE",   sequence: 3, isRequired: false, options: [] },
    { id: "q-008", sectionId: "sec-002", questionText: "Catatan tambahan keuangan",               answerType: "TEXT",    sequence: 4, isRequired: false, options: [] },
];

const QUESTIONS_SEC3: SurveyQuestion[] = [
    { id: "q-009", sectionId: "sec-003", questionText: "Nama agunan utama",                       answerType: "TEXT",    sequence: 1, isRequired: true,  options: [] },
    { id: "q-010", sectionId: "sec-003", questionText: "Apakah agunan sudah dicek fisik?",         answerType: "BOOLEAN", sequence: 2, isRequired: true,  options: [] },
    { id: "q-011", sectionId: "sec-003", questionText: "Foto agunan",                              answerType: "IMAGE",   sequence: 3, isRequired: false, options: [] },
    { id: "q-012", sectionId: "sec-003", questionText: "Estimasi nilai pasar agunan (Rp)",         answerType: "NUMBER",  sequence: 4, isRequired: true,  options: [] },
];

// proto: SurveySection
const SECTIONS_TMPl1: SurveySection[] = [
    { id: "sec-001", templateId: "tmpl-001", sectionName: "Verifikasi Lokasi Usaha", sequence: 1, questions: QUESTIONS_SEC1 },
    { id: "sec-002", templateId: "tmpl-001", sectionName: "Data Keuangan Lapangan",  sequence: 2, questions: QUESTIONS_SEC2 },
    { id: "sec-003", templateId: "tmpl-001", sectionName: "Pemeriksaan Agunan",       sequence: 3, questions: QUESTIONS_SEC3 },
];

// proto: SurveyTemplate
const DUMMY_TEMPLATES: SurveyTemplate[] = [
    {
        id: "tmpl-001",
        templateCode: "SURVEY-SME",
        templateName: "Survey UMK",
        applicantType: "PERSONAL",
        productId: "prod-001",
        active: true,
        sections: SECTIONS_TMPl1,
    },
    {
        id: "tmpl-002",
        templateCode: "SURVEY-CORP",
        templateName: "Survey Korporasi",
        applicantType: "COMPANY",
        productId: "prod-002",
        active: true,
        sections: [
            { id: "sec-004", templateId: "tmpl-002", sectionName: "Profil Perusahaan",         sequence: 1, questions: [] },
            { id: "sec-005", templateId: "tmpl-002", sectionName: "Kondisi Fasilitas Produksi", sequence: 2, questions: [] },
        ],
    },
    {
        id: "tmpl-003",
        templateCode: "SURVEY-PROPERTY",
        templateName: "Survey Properti KPR",
        applicantType: "PERSONAL",
        productId: "prod-003",
        active: true,
        sections: [
            { id: "sec-006", templateId: "tmpl-003", sectionName: "Cek Fisik Properti",  sequence: 1, questions: [] },
            { id: "sec-007", templateId: "tmpl-003", sectionName: "Dokumen Legal",       sequence: 2, questions: [] },
        ],
    },
    {
        id: "tmpl-004",
        templateCode: "SURVEY-KKB",
        templateName: "Survey Kendaraan",
        applicantType: "PERSONAL",
        productId: "prod-004",
        active: false,
        sections: [],
    },
];

// proto: SurveyAnswer
const DUMMY_ANSWERS: Record<string, SurveyAnswer[]> = {
    "surv-001": [
        { id: "ans-001", surveyId: "surv-001", questionId: "q-001", answerBoolean: true,                                  answeredAt: new Date("2026-03-20T09:10:00Z").toISOString() },
        { id: "ans-002", surveyId: "surv-001", questionId: "q-002", answerText: "Jl. Merdeka No. 12, Jakarta Selatan",    answeredAt: new Date("2026-03-20T09:12:00Z").toISOString() },
        { id: "ans-003", surveyId: "surv-001", questionId: "q-003", answerText: "GOOD",                                   answeredAt: new Date("2026-03-20T09:15:00Z").toISOString() },
        { id: "ans-004", surveyId: "surv-001", questionId: "q-004", answerText: "https://storage.example.com/img/001.jpg", answeredAt: new Date("2026-03-20T09:20:00Z").toISOString() },
        { id: "ans-005", surveyId: "surv-001", questionId: "q-005", answerNumber: "15000000",                              answeredAt: new Date("2026-03-20T09:30:00Z").toISOString() },
        { id: "ans-006", surveyId: "surv-001", questionId: "q-006", answerBoolean: true,                                  answeredAt: new Date("2026-03-20T09:32:00Z").toISOString() },
    ],
};

// proto: ApplicationSurvey (Survey)
const DUMMY_SURVEYS: Survey[] = [
    {
        id: "surv-001",
        applicationId: "app-001",
        templateId: "tmpl-001",
        surveyType: "ON_SITE",
        status: "SUBMITTED",
        assignedTo: "ao-001",
        surveyPurpose: "Verifikasi usaha pemohon sebelum analisa kredit",
        startedAt: new Date("2026-03-20T09:00:00Z").toISOString(),
        submittedAt: new Date("2026-03-20T11:00:00Z").toISOString(),
        submittedBy: "ao-001",
        applicantName: "Budi Santoso",
        applicationStatus: "INTAKE",
        totalQuestions: 12,
        answeredQuestions: 6,
        answers: DUMMY_ANSWERS["surv-001"],
    },
    {
        id: "surv-002",
        applicationId: "app-002",
        templateId: "tmpl-002",
        surveyType: "ON_SITE",
        status: "VERIFIED",
        assignedTo: "ao-002",
        surveyPurpose: "Survey korporasi untuk verifikasi fasilitas produksi",
        startedAt: new Date("2026-03-10T08:00:00Z").toISOString(),
        submittedAt: new Date("2026-03-10T15:00:00Z").toISOString(),
        submittedBy: "ao-002",
        applicantName: "PT Sejahtera Abadi",
        applicationStatus: "ANALYSIS",
        totalQuestions: 10,
        answeredQuestions: 10,
        answers: [],
    },
    {
        id: "surv-003",
        applicationId: "app-004",
        templateId: "tmpl-001",
        surveyType: "ON_SITE",
        status: "ASSIGNED",
        assignedTo: "ao-001",
        surveyPurpose: "Survey agunan KPR",
        startedAt: undefined,
        submittedAt: undefined,
        submittedBy: undefined,
        applicantName: "Budi Santoso",
        applicationStatus: "COMMITTEE",
        totalQuestions: 12,
        answeredQuestions: 0,
        answers: [],
    },
    {
        id: "surv-004",
        applicationId: "app-003",
        templateId: "tmpl-003",
        surveyType: "DESK_REVIEW",
        status: "IN_PROGRESS",
        assignedTo: "ao-003",
        surveyPurpose: "Review dokumen properti KPR",
        startedAt: new Date("2026-03-22T10:00:00Z").toISOString(),
        submittedAt: undefined,
        submittedBy: undefined,
        applicantName: "Siti Aminah",
        applicationStatus: "APPROVED",
        totalQuestions: 8,
        answeredQuestions: 3,
        answers: [],
    },
];

// proto: SurveyEvidence
const DUMMY_EVIDENCES: Record<string, SurveyEvidence[]> = {
    "surv-001": [
        { id: "ev-001", surveyId: "surv-001", evidenceType: "PHOTO", fileUrl: "https://storage.example.com/ev/001a.jpg", description: "Tampak depan toko",  capturedAt: new Date("2026-03-20T09:25:00Z").toISOString() },
        { id: "ev-002", surveyId: "surv-001", evidenceType: "PHOTO", fileUrl: "https://storage.example.com/ev/001b.jpg", description: "Tampak dalam toko", capturedAt: new Date("2026-03-20T09:28:00Z").toISOString() },
    ],
    "surv-002": [
        { id: "ev-003", surveyId: "surv-002", evidenceType: "PHOTO",    fileUrl: "https://storage.example.com/ev/002a.jpg", description: "Gedung pabrik",       capturedAt: new Date("2026-03-10T10:00:00Z").toISOString() },
        { id: "ev-004", surveyId: "surv-002", evidenceType: "DOCUMENT",  fileUrl: "https://storage.example.com/ev/002b.pdf", description: "Laporan keuangan",    capturedAt: new Date("2026-03-10T11:00:00Z").toISOString() },
    ],
};

export const surveyService = {
    // ===== TEMPLATES (USER) =====

    /** Maps to proto: GetSurveyTemplate */
    getTemplate: async (id: string): Promise<SurveyTemplate | null> => {
        if (USE_DUMMY_DATA) return DUMMY_TEMPLATES.find(t => t.id === id) || null;
        return apiClient.get<SurveyTemplate>(`/v1/survey-templates/${id}`);
    },

    /** Maps to proto: ListSurveyTemplates */
    getTemplates: async (): Promise<{ templates: SurveyTemplate[] }> => {
        if (USE_DUMMY_DATA) return { templates: DUMMY_TEMPLATES };
        return apiClient.get<{ templates: SurveyTemplate[] }>('/v1/survey-templates');
    },

    // ===== TEMPLATES (ADMIN) =====

    /** Maps to proto: ListAdminSurveyTemplates */
    listAdminTemplates: async (): Promise<{ templates: SurveyTemplate[] }> => {
        if (USE_DUMMY_DATA) return { templates: DUMMY_TEMPLATES };
        return apiClient.get<{ templates: SurveyTemplate[] }>('/v1/admin/survey-templates');
    },

    /** Maps to proto: CreateSurveyTemplate */
    createTemplate: async (payload: {
        templateCode: string;
        templateName: string;
        applicantType: string;
        productId: string;
        active: boolean;
    }): Promise<SurveyTemplate> => {
        if (USE_DUMMY_DATA) {
            const newTemplate: SurveyTemplate = { id: `tmpl-${Date.now()}`, ...payload, sections: [] };
            DUMMY_TEMPLATES.push(newTemplate);
            return newTemplate;
        }
        return apiClient.post<SurveyTemplate>('/v1/admin/survey-templates', payload);
    },

    /** Maps to proto: ReorderSurveySections */
    reorderSections: async (templateId: string, sections: OrderItem[]): Promise<void> => {
        if (USE_DUMMY_DATA) {
            const tmpl = DUMMY_TEMPLATES.find(t => t.id === templateId);
            if (tmpl && tmpl.sections) {
                sections.forEach(item => {
                    const sec = tmpl.sections?.find(s => s.id === item.id);
                    if (sec) sec.sequence = item.sequence;
                });
                tmpl.sections.sort((a, b) => a.sequence - b.sequence);
            }
            return;
        }
        return apiClient.put(`/v1/survey-templates/${templateId}/sections/reorder`, { templateId, sections });
    },


    /** Maps to proto: UpdateSurveyTemplate */
    updateTemplate: async (id: string, payload: {
        templateCode: string;
        templateName: string;
        applicantType: string;
        productId: string;
        active: boolean;
    }): Promise<SurveyTemplate | null> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_TEMPLATES.findIndex(t => t.id === id);
            if (idx !== -1) { DUMMY_TEMPLATES[idx] = { ...DUMMY_TEMPLATES[idx], ...payload }; return DUMMY_TEMPLATES[idx]; }
            return null;
        }
        return apiClient.put<SurveyTemplate>(`/v1/admin/survey-templates/${id}`, payload);
    },

    /** Maps to proto: UpdateSurveyTemplateStatus */
    updateTemplateStatus: async (id: string, active: boolean): Promise<SurveyTemplate | null> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_TEMPLATES.findIndex(t => t.id === id);
            if (idx !== -1) { DUMMY_TEMPLATES[idx].active = active; return DUMMY_TEMPLATES[idx]; }
            return null;
        }
        return apiClient.patch<SurveyTemplate>(`/v1/admin/survey-templates/${id}/status`, { id, active });
    },

    // ===== SECTIONS & QUESTIONS =====

    /** Maps to proto: ListSurveySections */
    listSections: async (templateId: string): Promise<{ sections: SurveySection[] }> => {
        if (USE_DUMMY_DATA) {
            const template = DUMMY_TEMPLATES.find(t => t.id === templateId);
            return { sections: template?.sections || [] };
        }
        return apiClient.get<{ sections: SurveySection[] }>(`/v1/survey-templates/${templateId}/sections`);
    },

    /** Maps to proto: CreateSurveySection */
    createSection: async (templateId: string, payload: { sectionName: string; sequence: number }): Promise<SurveySection> => {
        if (USE_DUMMY_DATA) {
            const newSection: SurveySection = { id: `sec-${Date.now()}`, templateId, ...payload, questions: [] };
            const tmplIdx = DUMMY_TEMPLATES.findIndex(t => t.id === templateId);
            if (tmplIdx !== -1) DUMMY_TEMPLATES[tmplIdx].sections?.push(newSection);
            return newSection;
        }
        return apiClient.post<SurveySection>(`/v1/survey-templates/${templateId}/sections`, payload);
    },

    /** Maps to proto: ListSurveyQuestions */
    listQuestions: async (sectionId: string): Promise<{ questions: SurveyQuestion[] }> => {
        if (USE_DUMMY_DATA) {
            for (const tmpl of DUMMY_TEMPLATES) {
                const section = tmpl.sections?.find(s => s.id === sectionId);
                if (section) return { questions: section.questions || [] };
            }
            return { questions: [] };
        }
        return apiClient.get<{ questions: SurveyQuestion[] }>(`/v1/sections/${sectionId}/questions`);
    },

    /** Maps to proto: CreateSurveyQuestion */
    createQuestion: async (sectionId: string, payload: {
        questionText: string;
        answerType: string;
        sequence: number;
        isRequired: boolean;
    }): Promise<SurveyQuestion> => {
        if (USE_DUMMY_DATA) {
            const newQ: SurveyQuestion = { id: `q-${Date.now()}`, sectionId, ...payload as any, options: [] };
            for (const tmpl of DUMMY_TEMPLATES) {
                const sec = tmpl.sections?.find(s => s.id === sectionId);
                if (sec) { sec.questions?.push(newQ); break; }
            }
            return newQ;
        }
        return apiClient.post<SurveyQuestion>(`/v1/sections/${sectionId}/questions`, payload);
    },

    /** Maps to proto: ReorderSurveyQuestions */
    reorderQuestions: async (sectionId: string, questions: OrderItem[]): Promise<void> => {
        if (USE_DUMMY_DATA) {
            for (const tmpl of DUMMY_TEMPLATES) {
                const sec = tmpl.sections?.find(s => s.id === sectionId);
                if (sec && sec.questions) {
                    questions.forEach(item => {
                        const q = sec.questions?.find(qi => qi.id === item.id);
                        if (q) q.sequence = item.sequence;
                    });
                    sec.questions.sort((a, b) => a.sequence - b.sequence);
                    break;
                }
            }
            return;
        }
        return apiClient.put(`/v1/sections/${sectionId}/questions/reorder`, { sectionId, questions });
    },


    /** Maps to proto: CreateSurveyQuestionOption */
    createQuestionOption: async (questionId: string, payload: { optionText: string; optionValue: string }): Promise<SurveyQuestionOption> => {
        if (USE_DUMMY_DATA) {
            const newOpt: SurveyQuestionOption = { id: `opt-${Date.now()}`, questionId, ...payload };
            for (const tmpl of DUMMY_TEMPLATES) {
                for (const sec of tmpl.sections || []) {
                    const q = sec.questions?.find(q => q.id === questionId);
                    if (q) { q.options?.push(newOpt); break; }
                }
            }
            return newOpt;
        }
        return apiClient.post<SurveyQuestionOption>(`/v1/questions/${questionId}/options`, payload);
    },

    // ===== APPLICATION SURVEYS =====

    /** Maps to proto: AssignSurvey */
    assignSurvey: async (applicationId: string, payload: {
        templateId: string;
        surveyType: string;
        assignedTo: string;
        surveyPurpose: string;
    }): Promise<Survey> => {
        if (USE_DUMMY_DATA) {
            const newSurvey: Survey = {
                id: `surv-${Date.now()}`,
                applicationId,
                templateId: payload.templateId,
                surveyType: payload.surveyType,
                status: "ASSIGNED",
                assignedTo: payload.assignedTo,
                surveyPurpose: payload.surveyPurpose,
                totalQuestions: 0,
                answeredQuestions: 0,
                answers: [],
            };
            DUMMY_SURVEYS.push(newSurvey);
            return newSurvey;
        }
        return apiClient.post<Survey>(`/v1/applications/${applicationId}/surveys`, payload);
    },

    /** Maps to proto: GetSurvey */
    getSurvey: async (id: string): Promise<Survey | null> => {
        if (USE_DUMMY_DATA) return DUMMY_SURVEYS.find(s => s.id === id) || null;
        return apiClient.get<Survey>(`/v1/surveys/${id}`);
    },

    /** Maps to proto: ListSurveysByApplication */
    listByApplication: async (applicationId: string): Promise<{ surveys: Survey[] }> => {
        if (USE_DUMMY_DATA) return { surveys: DUMMY_SURVEYS.filter(s => s.applicationId === applicationId) };
        return apiClient.get<{ surveys: Survey[] }>(`/v1/applications/${applicationId}/surveys`);
    },

    /** Maps to proto: ListSurveys */
    listSurveys: async (params?: {
        status?: string;
        applicationId?: string;
        assignedTo?: string;
        surveyType?: string;
        pageSize?: number;
        cursor?: string;
    }): Promise<{ surveys: Survey[]; nextCursor: string; hasNext: boolean }> => {
        if (USE_DUMMY_DATA) {
            let filtered = [...DUMMY_SURVEYS];
            if (params?.status) filtered = filtered.filter(s => s.status === params.status);
            if (params?.applicationId) filtered = filtered.filter(s => s.applicationId === params.applicationId);
            if (params?.assignedTo) filtered = filtered.filter(s => s.assignedTo === params.assignedTo);
            if (params?.surveyType) filtered = filtered.filter(s => s.surveyType === params.surveyType);
            return { surveys: filtered, nextCursor: "", hasNext: false };
        }
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

    // ===== WORKFLOW =====

    /** Maps to proto: StartSurvey */
    startSurvey: async (id: string, userId?: string): Promise<Survey | null> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_SURVEYS.findIndex(s => s.id === id);
            if (idx !== -1) {
                DUMMY_SURVEYS[idx].status = "IN_PROGRESS";
                DUMMY_SURVEYS[idx].startedAt = new Date().toISOString();
                return { ...DUMMY_SURVEYS[idx] };
            }
            return null;
        }
        return apiClient.put<Survey>(`/v1/surveys/${id}/start`, { id, userId });
    },

    /** Maps to proto: SubmitSurvey */
    submitSurvey: async (id: string, userId?: string): Promise<Survey | null> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_SURVEYS.findIndex(s => s.id === id);
            if (idx !== -1) {
                DUMMY_SURVEYS[idx].status = "SUBMITTED";
                DUMMY_SURVEYS[idx].submittedAt = new Date().toISOString();
                DUMMY_SURVEYS[idx].submittedBy = userId;
                return { ...DUMMY_SURVEYS[idx] };
            }
            return null;
        }
        return apiClient.put<Survey>(`/v1/surveys/${id}/submit`, { id, userId });
    },

    /** Maps to proto: VerifySurvey */
    verifySurvey: async (id: string, userId?: string): Promise<Survey | null> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_SURVEYS.findIndex(s => s.id === id);
            if (idx !== -1) {
                DUMMY_SURVEYS[idx].status = "VERIFIED";
                return { ...DUMMY_SURVEYS[idx] };
            }
            return null;
        }
        return apiClient.put<Survey>(`/v1/surveys/${id}/verify`, { id, userId });
    },

    // ===== ANSWERS & EVIDENCE =====

    /** Maps to proto: ListSurveyAnswers */
    listAnswers: async (surveyId: string): Promise<{ answers: SurveyAnswer[] }> => {
        if (USE_DUMMY_DATA) return { answers: DUMMY_ANSWERS[surveyId] || [] };
        return apiClient.get<{ answers: SurveyAnswer[] }>(`/v1/surveys/${surveyId}/answers`);
    },

    /** Maps to proto: SubmitSurveyAnswer */
    submitAnswer: async (surveyId: string, questionId: string, payload: Partial<SurveyAnswer>): Promise<SurveyAnswer> => {
        if (USE_DUMMY_DATA) {
            const newAnswer: SurveyAnswer = {
                id: `ans-${Date.now()}`,
                surveyId,
                questionId,
                ...payload,
                answeredAt: new Date().toISOString(),
            };
            if (!DUMMY_ANSWERS[surveyId]) DUMMY_ANSWERS[surveyId] = [];
            const existing = DUMMY_ANSWERS[surveyId].findIndex(a => a.questionId === questionId);
            if (existing !== -1) DUMMY_ANSWERS[surveyId][existing] = newAnswer;
            else DUMMY_ANSWERS[surveyId].push(newAnswer);

            // Update answeredQuestions count
            const surveyIdx = DUMMY_SURVEYS.findIndex(s => s.id === surveyId);
            if (surveyIdx !== -1) DUMMY_SURVEYS[surveyIdx].answeredQuestions = DUMMY_ANSWERS[surveyId].length;

            return newAnswer;
        }
        return apiClient.post<SurveyAnswer>(`/v1/surveys/${surveyId}/answers`, { ...payload, questionId });
    },

    /** Maps to proto: UploadSurveyEvidence */
    uploadEvidence: async (surveyId: string, payload: {
        evidenceType: string;
        fileUrl: string;
        description: string;
    }): Promise<SurveyEvidence> => {
        if (USE_DUMMY_DATA) {
            const newEvidence: SurveyEvidence = {
                id: `ev-${Date.now()}`,
                surveyId,
                ...payload,
                capturedAt: new Date().toISOString(),
            };
            if (!DUMMY_EVIDENCES[surveyId]) DUMMY_EVIDENCES[surveyId] = [];
            DUMMY_EVIDENCES[surveyId].push(newEvidence);
            return newEvidence;
        }
        return apiClient.post<SurveyEvidence>(`/v1/surveys/${surveyId}/evidences`, payload);
    },

    /** Helper to get evidences (not a direct proto RPC but common UI need) */
    listEvidences: async (surveyId: string): Promise<SurveyEvidence[]> => {
        if (USE_DUMMY_DATA) return DUMMY_EVIDENCES[surveyId] || [];
        return [];
    },
};
