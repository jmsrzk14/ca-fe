import { apiClient } from '../client';
import { FinancialFact, Asset, Liability, FinancialRatio } from '@/shared/types/api';

export const financialService = {
    getFinancialFacts: (applicationId: string) =>
        apiClient.get<FinancialFact[]>(`/v1/applications/${applicationId}/financial-facts`),

    addAsset: (applicationId: string, asset: Partial<Asset>) =>
        apiClient.post<Asset>(`/v1/applications/${applicationId}/assets`, asset),

    getAssets: (applicationId: string) =>
        apiClient.get<Asset[]>(`/v1/applications/${applicationId}/assets`),

    addLiability: (applicationId: string, liability: Partial<Liability>) =>
        apiClient.post<Liability>(`/v1/applications/${applicationId}/liabilities`, liability),

    upsertRatios: (applicationId: string, ratios: FinancialRatio[]) =>
        apiClient.post<FinancialRatio[]>(`/v1/applications/${applicationId}/financial-ratios`, ratios),
};
