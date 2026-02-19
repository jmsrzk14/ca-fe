import { apiClient } from '../client';
import { Applicant, PaginatedResponse, Attribute } from '@/shared/types/api';

export const applicantService = {
    create: (data: Partial<Applicant>) =>
        apiClient.post<Applicant>('/v1/applicants', data),

    getById: (id: string) =>
        apiClient.get<Applicant>(`/v1/applicants/${id}`),

    update: (id: string, data: Partial<Applicant>) =>
        apiClient.put<Applicant>(`/v1/applicants/${id}`, data),

    list: (params?: Record<string, string>) =>
        apiClient.get<PaginatedResponse<Applicant>>('/v1/applicants', { params }),

    upsertAttribute: (applicantId: string, attribute: Attribute) =>
        apiClient.post<Attribute>(`/v1/applicants/${applicantId}/attributes`, attribute),
};
