import { apiClient } from '../client';
import { LoanProduct, Branch, GLAccount } from '@/shared/types/api';

export const referenceService = {
    getLoanProducts: () =>
        apiClient.get<LoanProduct[]>('/v1/reference/loan-products'),

    getBranches: () =>
        apiClient.get<Branch[]>('/v1/reference/branches'),

    getGLAccounts: () =>
        apiClient.get<GLAccount[]>('/v1/reference/gl-accounts'),
};
