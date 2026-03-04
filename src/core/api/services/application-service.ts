import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { ApplicationService } from "@/gen/application/v1/application_connect";
import { Application } from "@/shared/types/api";
import { apiClient } from '../client';

const client = createPromiseClient(ApplicationService, transport);

/**
 * Robustly parses a timestamp from the REST/gRPC response.
 */
function parseTimestamp(ts: any): string | undefined {
    if (!ts) return undefined;
    if (typeof ts === 'string') return ts;
    if (ts.seconds !== undefined) {
        try {
            return new Date(Number(ts.seconds) * 1000).toISOString();
        } catch {
            return undefined;
        }
    }
    try {
        const d = new Date(ts);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
    } catch {
        return undefined;
    }
}

// --- DUMMY DATA BLOCK START ---
const USE_DUMMY_DATA = false;

const DUMMY_APPLICATIONS: any[] = [
    {
        id: "dummy-loan-1",
        applicantId: "dummy-app-3",
        productId: "prod-1",
        aoId: "ao-1",
        loanAmount: "50000000",
        tenorMonths: 12,
        interestType: "FLAT",
        interestRate: "1.5",
        loanPurpose: "Modal Usaha",
        applicationChannel: "BRANCH",
        status: "INTAKE",
        branchCode: "JKT01",
        attributes: [],
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
    },
    {
        id: "dummy-loan-2",
        applicantId: "dummy-app-2",
        productId: "prod-2",
        aoId: "ao-2",
        loanAmount: "250000000",
        tenorMonths: 36,
        interestType: "EFFECTIVE",
        interestRate: "1.2",
        loanPurpose: "Ekspansi Bisnis",
        applicationChannel: "ONLINE",
        status: "APPROVED",
        branchCode: "JKT02",
        attributes: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: "dummy-loan-3",
        applicantId: "dummy-app-3",
        productId: "prod-1",
        aoId: "ao-1",
        loanAmount: "15000000",
        tenorMonths: 6,
        interestType: "FLAT",
        interestRate: "2.0",
        loanPurpose: "Biaya Pendidikan",
        applicationChannel: "APP",
        status: "ANALYSIS",
        branchCode: "JKT01",
        attributes: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        submittedAt: new Date(Date.now() - 172800000).toISOString(),
    }
];
// --- DUMMY DATA BLOCK END ---

export const applicationService = {
    create: async (data: Partial<Application>) => {
        if (USE_DUMMY_DATA) {
            const newApp = {
                ...data,
                id: `dummy-loan-${Date.now()}`,
                status: "SUBMITTED",
                createdAt: new Date().toISOString(),
                submittedAt: new Date().toISOString()
            };
            DUMMY_APPLICATIONS.unshift(newApp);
            return newApp;
        }

        const response = await client.createApplication({
            applicantId: data.applicantId,
            productId: data.productId,
            aoId: data.aoId,
            loanAmount: data.loanAmount?.toString() || "0",
            tenorMonths: data.tenorMonths || 0,
            interestType: data.interestType || "",
            interestRate: data.interestRate?.toString() || "0",
            loanPurpose: data.loanPurpose || "",
            applicationChannel: data.applicationChannel || "",
            branchCode: data.branchCode || "",
            attributes: data.attributes?.map(a => ({
                attributeId: a.attributeId,
                value: a.value,
                dataType: a.dataType,
                attributeOptionId: a.attributeOptionId
            })) || []
        });
        return response;
    },

    getById: async (id: string) => {
        if (USE_DUMMY_DATA) {
            const app = DUMMY_APPLICATIONS.find(a => a.id === id);
            return app ? { ...app } : null;
        }
        const response = await client.getApplication({ id });
        return {
            id: response.id,
            applicantId: response.applicantId,
            applicantName: response.applicantName,
            productId: response.productId,
            aoId: response.aoId,
            loanAmount: response.loanAmount,
            tenorMonths: response.tenorMonths,
            interestType: response.interestType,
            interestRate: response.interestRate,
            loanPurpose: response.loanPurpose,
            applicationChannel: response.applicationChannel,
            status: response.status as any,
            branchCode: response.branchCode,
            attributes: (response.attributes || []).map((attr: any) => ({
                attributeId: attr.attributeId,
                value: attr.value,
                dataType: attr.dataType,
                attributeOptionId: attr.attributeOptionId
            })),
            createdAt: parseTimestamp(response.createdAt) || new Date().toISOString(),
            submittedAt: parseTimestamp(response.submittedAt) || null,
        };
    },

    list: async (params?: Record<string, string>) => {
        if (USE_DUMMY_DATA) {
            let filtered = [...DUMMY_APPLICATIONS];
            if (params?.status) {
                filtered = filtered.filter(a => a.status === params.status);
            }
            if (params?.applicantId) {
                filtered = filtered.filter(a => a.applicantId === params.applicantId);
            }
            return {
                applications: filtered,
                nextCursor: "",
            };
        }

        const response = await client.listApplications({
            cursor: params?.cursor || "",
            status: params?.status || "",
            applicantId: params?.applicantId || ""
        });

        return {
            applications: (response.applications || []).map((app: any) => ({
                id: app.id || "unknown-id",
                applicantId: app.applicantId || "unknown-applicant",
                applicantName: app.applicantName || "",
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
                attributes: (app.attributes || []).map((attr: any) => ({
                    attributeId: attr.attributeId,
                    value: attr.value,
                    dataType: attr.dataType,
                    attributeOptionId: attr.attributeOptionId
                })),
                createdAt: parseTimestamp(app.createdAt) || new Date().toISOString(),
                submittedAt: parseTimestamp(app.submittedAt) || null,
            })),
            nextCursor: response.nextCursor || "",
        };
    },

    updateStatus: async (id: string, status: string, reason: string = "") => {
        if (USE_DUMMY_DATA) {
            const index = DUMMY_APPLICATIONS.findIndex(a => a.id === id);
            if (index !== -1) {
                DUMMY_APPLICATIONS[index].status = status;
                return { success: true };
            }
            return { success: false };
        }

        return apiClient.put(`/v1/applications/${id}/status`, {
            id,
            newStatus: status,
            reason: reason
        });
    },
};
