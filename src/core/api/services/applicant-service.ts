import { createClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { ApplicantService } from "@/gen/applicant/v1/applicant_pb";

const client = createClient(ApplicantService, transport);

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

    getById: (id: string) =>
        client.getApplicant({ id }),

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
        try {
            const response = await client.listApplicants({
                cursor: params?.cursor || "",
            });

            // Map back to existing UI structure/types to avoid breaking components
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
        } catch (error) {
            console.error('Failed to fetch applicants from backend (likely 500 error):', error);
            console.warn('Using mock fallback data for display.');

            // Temporary Mock Data for UI stability while backend is being fixed
            return {
                applicants: [
                    {
                        id: "mock-1",
                        applicantType: "PERSONAL",
                        identityNumber: "3273010101010001",
                        taxId: "01.234.567.8-901.000",
                        fullName: "John Doe (Mock)",
                        birthDate: "1990-01-01",
                        establishmentDate: "",
                        attributes: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    {
                        id: "mock-2",
                        applicantType: "CORPORATE",
                        identityNumber: "02.345.678.9-012.000",
                        taxId: "02.345.678.9-012.000",
                        fullName: "PT Maju Bersama (Mock)",
                        birthDate: "",
                        establishmentDate: "2010-05-15",
                        attributes: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                ],
                nextCursor: ""
            };
        }
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
