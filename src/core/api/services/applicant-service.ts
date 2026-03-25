import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { ApplicantService } from "@/gen/applicant/v1/applicant_connect";
import { Applicant, ApplicantParty, ApplicantAttribute } from "@/shared/types/api";

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

function normalizeType(val: string | undefined): 'PERSONAL' | 'COMPANY' {
    const upper = (val || '').toUpperCase().trim();
    if (upper === 'CORPORATE' || upper === 'COMPANY') return 'COMPANY';
    return 'PERSONAL';
}

// ============================================================
// DUMMY DATA — aligned with proto: Applicant message
// ============================================================
const USE_DUMMY_DATA = false;

const DUMMY_APPLICANTS: Applicant[] = [
    {
        id: "apct-001",
        applicantType: "PERSONAL",
        identityNumber: "3271234567890001",
        taxId: "89.123.456.7-890.000",
        fullName: "Budi Santoso",
        birthDate: "1985-08-17",
        establishmentDate: "",
        attributes: [
            { attributeId: "attr-001", value: "Wiraswasta", dataType: "STRING", choiceId: "" },
            { attributeId: "attr-002", value: "5", dataType: "NUMBER", choiceId: "" },
        ],
        createdAt: new Date("2026-01-10T08:00:00Z").toISOString(),
    },
    {
        id: "apct-002",
        applicantType: "COMPANY",
        identityNumber: "1234567890",
        taxId: "12.345.678.9-012.000",
        fullName: "PT Sejahtera Abadi",
        birthDate: "",
        establishmentDate: "2010-05-15",
        attributes: [
            { attributeId: "attr-003", value: "Manufaktur", dataType: "STRING", choiceId: "ch-01" },
            { attributeId: "attr-004", value: "50", dataType: "NUMBER", choiceId: "" },
        ],
        createdAt: new Date("2026-01-15T09:00:00Z").toISOString(),
    },
    {
        id: "apct-003",
        applicantType: "PERSONAL",
        identityNumber: "3171234567890002",
        taxId: "77.123.456.7-890.000",
        fullName: "Siti Aminah",
        birthDate: "1992-12-01",
        establishmentDate: "",
        attributes: [
            { attributeId: "attr-001", value: "Karyawan Swasta", dataType: "STRING", choiceId: "" },
        ],
        createdAt: new Date("2026-02-01T07:00:00Z").toISOString(),
    },
    {
        id: "apct-004",
        applicantType: "COMPANY",
        identityNumber: "0987654321",
        taxId: "98.765.432.1-000.000",
        fullName: "CV Maju Bersama",
        birthDate: "",
        establishmentDate: "2015-03-20",
        attributes: [
            { attributeId: "attr-003", value: "Perdagangan", dataType: "STRING", choiceId: "ch-02" },
            { attributeId: "attr-004", value: "15", dataType: "NUMBER", choiceId: "" },
        ],
        createdAt: new Date("2026-02-10T10:00:00Z").toISOString(),
    },
];

// Dummy parties — maps to proto: ApplicantPartyResponse
const DUMMY_APPLICANT_PARTIES: Record<string, ApplicantParty[]> = {
    "apct-002": [
        {
            partyId: "apty-001",
            partyType: "PERSON",
            name: "Ahmad Direktur",
            identifier: "3271000000000001",
            dateOfBirth: "1975-04-10",
            roleCode: "DIRECTOR",
            ownershipPct: 60.0,
            position: "Direktur Utama",
            slikRequired: true,
        },
        {
            partyId: "apty-002",
            partyType: "PERSON",
            name: "Rina Komisaris",
            identifier: "3271000000000003",
            dateOfBirth: "1978-09-22",
            roleCode: "COMMISSIONER",
            ownershipPct: 40.0,
            position: "Komisaris",
            slikRequired: false,
        },
    ],
    "apct-004": [
        {
            partyId: "apty-003",
            partyType: "PERSON",
            name: "Hendra Owner",
            identifier: "3272000000000001",
            dateOfBirth: "1980-06-15",
            roleCode: "OWNER",
            ownershipPct: 100.0,
            position: "Pemilik",
            slikRequired: true,
        },
    ],
};

export const applicantService = {
    /** Maps to proto: CreateApplicant */
    create: async (data: Partial<Applicant>) => {
        if (USE_DUMMY_DATA) {
            const newApp: Applicant = {
                id: `apct-${Date.now()}`,
                applicantType: data.applicantType || "PERSONAL",
                identityNumber: data.identityNumber || "",
                taxId: data.taxId || "",
                fullName: data.fullName || "",
                birthDate: data.birthDate || "",
                establishmentDate: data.establishmentDate || "",
                attributes: data.attributes || [],
                createdAt: new Date().toISOString(),
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
            attributes: data.attributes?.map((attr: ApplicantAttribute) => ({
                attributeId: attr.attributeId,
                value: attr.value,
                dataType: attr.dataType,
                choiceId: attr.choiceId,
            })) || [],
        });
        return response;
    },

    /** Maps to proto: GetApplicant */
    getById: async (id: string): Promise<Applicant | null> => {
        if (USE_DUMMY_DATA) {
            const app = DUMMY_APPLICANTS.find(a => a.id === id);
            return app ? { ...app } : null;
        }

        const response = await client.getApplicant({ id });
        return {
            id: response.id || id,
            applicantType: normalizeType(response.applicantType),
            identityNumber: response.identityNumber || '',
            taxId: response.taxId || '',
            fullName: response.fullName || '',
            birthDate: response.birthDate || '',
            establishmentDate: response.establishmentDate || '',
            attributes: (response.attributes || []).map((attr: any) => ({
                attributeId: attr.attributeId || '',
                value: attr.value || '',
                dataType: attr.dataType || 'STRING',
                updatedAt: parseTimestamp(attr.updatedAt) || null,
                choiceId: attr.choiceId || '',
            })),
            createdAt: parseTimestamp(response.createdAt as any) || '',
        };
    },

    /** Maps to proto: UpdateApplicant */
    update: async (id: string, data: Partial<Applicant>) => {
        if (USE_DUMMY_DATA) {
            const index = DUMMY_APPLICANTS.findIndex(a => a.id === id);
            if (index !== -1) {
                DUMMY_APPLICANTS[index] = { ...DUMMY_APPLICANTS[index], ...data };
                return { ...DUMMY_APPLICANTS[index] };
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
            attributes: data.attributes?.map((attr: ApplicantAttribute) => ({
                attributeId: attr.attributeId,
                value: attr.value,
                dataType: attr.dataType,
                choiceId: attr.choiceId,
            })) || [],
        });
    },

    /** Maps to proto: ListApplicants */
    list: async (params?: { cursor?: string; pageSize?: number }) => {
        if (USE_DUMMY_DATA) {
            return {
                applicants: DUMMY_APPLICANTS,
                nextCursor: "",
                hasNext: false,
            };
        }

        const response = await client.listApplicants({
            cursor: params?.cursor || "",
            pageSize: params?.pageSize || 0,
        });

        return {
            applicants: (response.applicants || []).map((app: any) => ({
                id: app.id || "unknown",
                applicantType: normalizeType(app.applicantType),
                identityNumber: app.identityNumber || "",
                taxId: app.taxId || "",
                fullName: app.fullName || "Unnamed Applicant",
                birthDate: app.birthDate || "",
                establishmentDate: app.establishmentDate || "",
                attributes: (app.attributes || []).map((attr: any) => ({
                    attributeId: attr.attributeId || '',
                    value: attr.value || '',
                    dataType: attr.dataType || 'STRING',
                    updatedAt: parseTimestamp(attr.updatedAt) || null,
                    choiceId: attr.choiceId || '',
                })),
                createdAt: parseTimestamp(app.createdAt) || new Date().toISOString(),
            })),
            nextCursor: response.nextCursor || "",
            hasNext: response.hasNext || false,
        };
    },

    /** Maps to proto: UpsertApplicantAttributes */
    upsertAttributes: async (applicantId: string, attributes: ApplicantAttribute[]) => {
        if (USE_DUMMY_DATA) {
            const index = DUMMY_APPLICANTS.findIndex(a => a.id === applicantId);
            if (index !== -1) {
                attributes.forEach(attr => {
                    const existing = DUMMY_APPLICANTS[index].attributes.findIndex(
                        a => a.attributeId === attr.attributeId
                    );
                    if (existing !== -1) {
                        DUMMY_APPLICANTS[index].attributes[existing] = attr;
                    } else {
                        DUMMY_APPLICANTS[index].attributes.push(attr);
                    }
                });
            }
            return { attributes };
        }

        return client.upsertApplicantAttributes({
            applicantId,
            attributes: attributes.map(attr => ({
                attributeId: attr.attributeId,
                value: attr.value,
                dataType: attr.dataType,
                choiceId: attr.choiceId,
            })),
        });
    },

    /** @deprecated Use upsertAttributes */
    upsertAttribute: async (applicantId: string, attribute: ApplicantAttribute) => {
        return applicantService.upsertAttributes(applicantId, [attribute]);
    },

    /** Maps to proto: ListApplicantParties */
    listParties: async (applicantId: string): Promise<ApplicantParty[]> => {
        if (USE_DUMMY_DATA) {
            return DUMMY_APPLICANT_PARTIES[applicantId] || [];
        }
        const response = await client.listApplicantParties({ applicantId });
        return (response.parties || []).map((p: any) => ({
            partyId: p.partyId,
            partyType: p.partyType || 'PERSON',
            name: p.name || '',
            identifier: p.identifier || '',
            dateOfBirth: p.dateOfBirth || '',
            roleCode: p.roleCode || '',
            ownershipPct: p.ownershipPct || 0,
            position: p.position || '',
            slikRequired: p.slikRequired || false,
        }));
    },

    /** Maps to proto: AddApplicantParty */
    addParty: async (applicantId: string, data: {
        partyType: string;
        name: string;
        identifier: string;
        dateOfBirth: string;
        roleCode: string;
        ownershipPct?: number;
        position?: string;
        slikRequired?: boolean;
    }) => {
        if (USE_DUMMY_DATA) {
            const newParty: ApplicantParty = {
                partyId: `apty-${Date.now()}`,
                partyType: data.partyType,
                name: data.name,
                identifier: data.identifier,
                dateOfBirth: data.dateOfBirth,
                roleCode: data.roleCode,
                ownershipPct: data.ownershipPct || 0,
                position: data.position || '',
                slikRequired: data.slikRequired || false,
            };
            if (!DUMMY_APPLICANT_PARTIES[applicantId]) DUMMY_APPLICANT_PARTIES[applicantId] = [];
            DUMMY_APPLICANT_PARTIES[applicantId].push(newParty);
            return newParty;
        }
        return client.addApplicantParty({
            applicantId,
            partyType: data.partyType,
            name: data.name,
            identifier: data.identifier,
            dateOfBirth: data.dateOfBirth,
            roleCode: data.roleCode,
            ownershipPct: data.ownershipPct || 0,
            position: data.position || '',
            slikRequired: data.slikRequired || false,
        });
    },

    /** Maps to proto: UpdateApplicantParty */
    updateParty: async (applicantId: string, partyId: string, data: {
        roleCode: string;
        ownershipPct?: number;
        position?: string;
        slikRequired?: boolean;
    }) => {
        if (USE_DUMMY_DATA) {
            const parties = DUMMY_APPLICANT_PARTIES[applicantId] || [];
            const idx = parties.findIndex(p => p.partyId === partyId);
            if (idx !== -1) {
                parties[idx] = { ...parties[idx], ...data };
                return parties[idx];
            }
            return null;
        }
        return client.updateApplicantParty({
            applicantId,
            partyId,
            roleCode: data.roleCode,
            ownershipPct: data.ownershipPct || 0,
            position: data.position || '',
            slikRequired: data.slikRequired || false,
        });
    },

    /** Maps to proto: RemoveApplicantParty */
    removeParty: async (applicantId: string, partyId: string, roleCode: string) => {
        if (USE_DUMMY_DATA) {
            if (DUMMY_APPLICANT_PARTIES[applicantId]) {
                DUMMY_APPLICANT_PARTIES[applicantId] = DUMMY_APPLICANT_PARTIES[applicantId].filter(
                    p => p.partyId !== partyId
                );
            }
            return {};
        }
        return client.removeApplicantParty({ applicantId, partyId, roleCode });
    },
};
