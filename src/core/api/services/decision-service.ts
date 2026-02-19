import { apiClient } from '../client';
import { CommitteeSession, CommitteeVote, Decision } from '@/shared/types/api';

export const decisionService = {
    scheduleSession: (session: Partial<CommitteeSession>) =>
        apiClient.post<CommitteeSession>('/v1/committee/sessions', session),

    submitVote: (sessionId: string, vote: Partial<CommitteeVote>) =>
        apiClient.post<CommitteeVote>(`/v1/committee/sessions/${sessionId}/votes`, vote),

    finalizeSession: (sessionId: string) =>
        apiClient.post<void>(`/v1/committee/sessions/${sessionId}/finalize`, {}),

    getDecision: (applicationId: string) =>
        apiClient.get<Decision>(`/v1/applications/${applicationId}/decision`),
};
