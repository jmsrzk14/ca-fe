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

// --- DUMMY DATA BLOCK START ---
const USE_DUMMY_DATA = false;

const DUMMY_APPLICANTS: any[] = [
    {
        id: "dummy-app-1",
        applicantType: "PERSONAL",
        identityNumber: "3271234567890001",
        taxId: "89.123.456.7-890.000",
        fullName: "Budi Santoso",
        birthDate: "1985-08-17T00:00:00.000Z",
        establishmentDate: "",
        attributes: [],
        createdAt: new Date().toISOString(),
    },
    {
        id: "dummy-app-2",
        applicantType: "COMPANY",
        identityNumber: "1234567890",
        taxId: "12.345.678.9-012.000",
        fullName: "PT Sejahtera Abadi",
        birthDate: "",
        establishmentDate: "2010-05-15T00:00:00.000Z",
        attributes: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: "dummy-app-3",
        applicantType: "PERSONAL",
        identityNumber: "3171234567890002",
        taxId: "77.123.456.7-890.000",
        fullName: "Siti Aminah",
        birthDate: "1992-12-01T00:00:00.000Z",
        establishmentDate: "",
        attributes: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    }
];
// --- DUMMY DATA BLOCK END ---

export const applicantService = {
    create: async (data: any) => {
        if (USE_DUMMY_DATA) {
            const newApp = {
                ...data,
                id: `dummy-app-${Date.now()}`,
                createdAt: new Date().toISOString(),
                applicantType: data.applicantType || "PERSONAL",
            };
            DUMMY_APPLICANTS.unshift(newApp);
            return newApp;
        }

        const response = await client.createApplicant({
            applicantType: data.applicantType || "PERSONAL",
            identityNumber: data.identityNumber,
            taxId: data.taxId,
            fullName: data.fullName,
            birthDate: data.birthDate,
            establishmentDate: data.establishmentDate,
            attributes: data.attributes?.map((attr: any) => ({
                key: attr.key,
                value: attr.value,
                dataType: attr.dataType,
                updatedAt: attr.updatedAt ? (typeof attr.updatedAt === 'string' ? { seconds: BigInt(Math.floor(new Date(attr.updatedAt).getTime() / 1000)), nanos: 0 } : attr.updatedAt) : undefined
            })) || [],
            // Note: createApplicant proto might not have set_created_at, check if it's ignored or needed
            ...(data.createdAt ? { createdAt: typeof data.createdAt === 'string' ? { seconds: BigInt(Math.floor(new Date(data.createdAt).getTime() / 1000)), nanos: 0 } : data.createdAt } : {})
        } as any);
        return response;
    },

    getById: async (id: string) => {
        if (USE_DUMMY_DATA) {
            const app = DUMMY_APPLICANTS.find(a => a.id === id);
            return app ? { ...app } : null;
        }

        const response = await client.getApplicant({ id });
        return {
            ...response,
            applicantType: response.applicantType || "PERSONAL",
        };
    },

    update: async (id: string, data: any) => {
        if (USE_DUMMY_DATA) {
            const index = DUMMY_APPLICANTS.findIndex(a => a.id === id);
            if (index !== -1) {
                DUMMY_APPLICANTS[index] = { ...DUMMY_APPLICANTS[index], ...data };
                return DUMMY_APPLICANTS[index];
            }
            return null;
        }

        return client.updateApplicant({
            id,
            applicantType: data.applicantType || "PERSONAL",
            identityNumber: data.identityNumber,
            taxId: data.taxId,
            fullName: data.fullName,
            birthDate: data.birthDate,
            establishmentDate: data.establishmentDate,
            attributes: data.attributes?.map((attr: any) => ({
                key: attr.key,
                value: attr.value,
                dataType: attr.dataType,
                updatedAt: attr.updatedAt ? (typeof attr.updatedAt === 'string' ? { seconds: BigInt(Math.floor(new Date(attr.updatedAt).getTime() / 1000)), nanos: 0 } : attr.updatedAt) : undefined
            })) || [],
        } as any);
    },

    list: async (params?: Record<string, string>) => {
        if (USE_DUMMY_DATA) {
            return {
                applicants: DUMMY_APPLICANTS,
                nextCursor: "",
            };
        }

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
                applicantType: app.applicantType || "PERSONAL",
                identityNumber: app.identityNumber || "",
                taxId: app.taxId || "",
                fullName: app.fullName || "Unnamed Applicant",
                birthDate: parseTimestamp(app.birthDate) || "",
                establishmentDate: parseTimestamp(app.establishmentDate) || "",
                attributes: app.attributes || [],
                createdAt: parseTimestamp(app.createdAt) || new Date().toISOString(),
            })),
            nextCursor: response.nextCursor || "",
        };
    },

    upsertAttribute: async (applicantId: string, attribute: any) => {
        if (USE_DUMMY_DATA) {
            return { success: true };
        }

        return client.upsertApplicantAttributes({
            applicantId,
            attributes: [{
                key: attribute.key,
                value: attribute.value,
                dataType: attribute.dataType,
            }],
        });
    }
};
