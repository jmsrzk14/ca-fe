import { apiClient } from "../client";
import { Application } from "@/shared/types/api";

/**
 * Robustly parses a timestamp from the REST/gRPC response.
 */
function parseTimestamp(ts: any): string | undefined {
    if (!ts) return undefined;

    // If it's already an ISO string
    if (typeof ts === 'string') return ts;

    // If it's a google.protobuf.Timestamp message object
    if (ts.seconds !== undefined) {
        try {
            return new Date(Number(ts.seconds) * 1000).toISOString();
        } catch {
            return undefined;
        }
    }

    // Fallback for any other date-like object
    try {
        const d = new Date(ts);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
    } catch {
        return undefined;
    }
}

export const applicationService = {
    create: async (data: Partial<Application>) => {
        return apiClient.post('/v1/applications', data);
    },

    getById: (id: string) =>
        apiClient.get<Application>(`/v1/applications/${id}`),

    list: async (params?: Record<string, string>) => {
        const response = await apiClient.get<{ applications: any[], nextCursor: string }>('/v1/applications', { params });

        return {
            applications: (response.applications || []).map(app => ({
                id: app.id || "unknown-id",
                applicantId: app.applicantId || "unknown-applicant",
                productId: app.productId || "",
                aoId: app.aoId || "",
                loanAmount: app.loanAmount || "0",
                tenorMonths: app.tenorMonths || 0,
                interestType: app.interestType || "",
                interestRate: app.interestRate || "0",
                loanPurpose: app.loanPurpose || "",
                applicationChannel: app.applicationChannel || "",
                status: (app.status || "UNKNOWN") as any,
                branchCode: app.branchCode || "",
                attributes: app.attributes || [],
                createdAt: parseTimestamp(app.createdAt) || new Date().toISOString(),
                updatedAt: parseTimestamp(app.updatedAt) || new Date().toISOString(),
                submittedAt: parseTimestamp(app.submittedAt) || null,
            })),
            nextCursor: response.nextCursor || "",
        };
    },

    updateStatus: async (id: string, status: string) => {
        return apiClient.post(`/v1/applications/${id}/status`, { newStatus: status, reason: "" });
    },
};
