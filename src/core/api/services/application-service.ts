import { apiClient } from '../client';
import { Application, StatusLog, PaginatedResponse } from '@/shared/types/api';

export const applicationService = {
    create: (data: Partial<Application>) =>
        apiClient.post<Application>('/v1/applications', data),

    getById: (id: string) =>
        apiClient.get<Application>(`/v1/applications/${id}`),

    list: (params?: Record<string, string>) =>
        apiClient.get<PaginatedResponse<Application>>('/v1/applications', { params }),

    delete: (id: string) =>
        apiClient.delete<void>(`/v1/applications/${id}`),

    getStatusLogs: (applicationId: string) =>
        apiClient.get<StatusLog[]>(`/v1/applications/${applicationId}/status-logs`),
};
