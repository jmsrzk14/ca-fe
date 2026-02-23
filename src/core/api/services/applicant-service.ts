import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { ApplicantService } from "@/gen/applicant/v1/applicant_connect";

const client = createPromiseClient(ApplicantService, transport);

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

export const applicantService = {
    create: async (data: any) => {
        const response = await client.createApplicant({
            headType: data.applicantType || data.headType || "PERSONAL",
            identityNumber: data.identityNumber,
            taxId: data.taxId,
            fullName: data.fullName,
            birthDate: data.birthDate,
            establishmentDate: data.establishmentDate,
            attributes: data.attributes?.map((attr: any) => ({
                key: attr.key,
                value: attr.value,
                dataType: attr.dataType,
            })) || [],
        });
        return response;
    },

    getById: async (id: string) => {
        const response = await client.getApplicant({ id });
        return {
            ...response,
            applicantType: response.headType || "PERSONAL",
        };
    },

    update: (id: string, data: any) =>
        client.updateApplicant({
            id,
            headType: data.applicantType || data.headType || "PERSONAL",
            identityNumber: data.identityNumber,
            taxId: data.taxId,
            fullName: data.fullName,
            birthDate: data.birthDate,
            establishmentDate: data.establishmentDate,
            attributes: data.attributes?.map((attr: any) => ({
                key: attr.key,
                value: attr.value,
                dataType: attr.dataType,
            })) || [],
        }),

    list: async (params?: Record<string, string>) => {
        const response = await client.listApplicants({
            cursor: params?.cursor || "",
        });
        console.log("DEBUG: gRPC raw response:", response);
        if (typeof window !== 'undefined') {
            (window as any).lastApplicants = response;
        }

        return {
            applicants: (response.applicants || []).map((app: any) => ({
                id: app.id || "unknown",
                applicantType: app.headType || "PERSONAL",
                identityNumber: app.identityNumber || "",
                taxId: app.taxId || "",
                fullName: app.fullName || "Unnamed Applicant",
                birthDate: parseTimestamp(app.birthDate) || "",
                establishmentDate: parseTimestamp(app.establishmentDate) || "",
                attributes: app.attributes || [],
                createdAt: parseTimestamp(app.createdAt) || new Date().toISOString(),
                updatedAt: parseTimestamp(app.updatedAt) || new Date().toISOString(),
            })),
            nextCursor: response.nextCursor || "",
        };
    },

    upsertAttribute: (applicantId: string, attribute: any) =>
        client.upsertApplicantAttributes({
            applicantId,
            attributes: [{
                key: attribute.key,
                value: attribute.value,
                dataType: attribute.dataType,
            }],
        }),
};
