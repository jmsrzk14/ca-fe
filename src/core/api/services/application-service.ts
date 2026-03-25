import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { ApplicationService, PartyService } from "@/gen/application/v1/application_connect";
import { Application, ApplicationParty } from "@/shared/types/api";
import { apiClient } from '../client';

const client = createPromiseClient(ApplicationService, transport);
const partyClient = createPromiseClient(PartyService, transport);

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

// ============================================================
// DUMMY DATA — aligned with proto: Application message
// ============================================================
const USE_DUMMY_DATA = false;

const DUMMY_APPLICATIONS: Application[] = [
    {
        id: "app-001",
        applicantId: "apct-001",
        applicantName: "Budi Santoso",
        productId: "prod-001",
        aoId: "ao-001",
        loanAmount: "50000000",
        tenorMonths: 12,
        interestType: "FLAT",
        interestRate: "1.5",
        loanPurpose: "Modal Usaha",
        applicationChannel: "BRANCH",
        status: "INTAKE",
        branchCode: "JKT01",
        attributes: [
            { attributeId: "attr-001", value: "Wiraswasta", dataType: "STRING", choiceId: "" },
            { attributeId: "attr-002", value: "5", dataType: "NUMBER", choiceId: "" },
        ],
        submittedAt: new Date("2026-03-01T08:00:00Z").toISOString(),
        createdAt: new Date("2026-03-01T07:30:00Z").toISOString(),
    },
    {
        id: "app-002",
        applicantId: "apct-002",
        applicantName: "PT Sejahtera Abadi",
        productId: "prod-002",
        aoId: "ao-002",
        loanAmount: "250000000",
        tenorMonths: 36,
        interestType: "EFFECTIVE",
        interestRate: "1.2",
        loanPurpose: "Ekspansi Bisnis",
        applicationChannel: "ONLINE",
        status: "ANALYSIS",
        branchCode: "JKT02",
        attributes: [
            { attributeId: "attr-003", value: "Manufaktur", dataType: "STRING", choiceId: "ch-01" },
        ],
        submittedAt: new Date("2026-03-05T09:00:00Z").toISOString(),
        createdAt: new Date("2026-03-05T08:00:00Z").toISOString(),
    },
    {
        id: "app-003",
        applicantId: "apct-003",
        applicantName: "Siti Aminah",
        productId: "prod-001",
        aoId: "ao-001",
        loanAmount: "15000000",
        tenorMonths: 6,
        interestType: "FLAT",
        interestRate: "2.0",
        loanPurpose: "Biaya Pendidikan",
        applicationChannel: "APP",
        status: "APPROVED",
        branchCode: "JKT01",
        attributes: [],
        submittedAt: new Date("2026-03-10T10:00:00Z").toISOString(),
        createdAt: new Date("2026-03-10T09:30:00Z").toISOString(),
    },
    {
        id: "app-004",
        applicantId: "apct-001",
        applicantName: "Budi Santoso",
        productId: "prod-003",
        aoId: "ao-003",
        loanAmount: "100000000",
        tenorMonths: 24,
        interestType: "EFFECTIVE",
        interestRate: "0.9",
        loanPurpose: "Renovasi Properti",
        applicationChannel: "BRANCH",
        status: "COMMITTEE",
        branchCode: "JKT03",
        attributes: [
            { attributeId: "attr-004", value: "https://example.com/doc.pdf", dataType: "STRING", choiceId: "" },
        ],
        submittedAt: new Date("2026-03-15T11:00:00Z").toISOString(),
        createdAt: new Date("2026-03-15T10:30:00Z").toISOString(),
    },
    {
        id: "app-005",
        applicantId: "apct-004",
        applicantName: "CV Maju Bersama",
        productId: "prod-002",
        aoId: "ao-002",
        loanAmount: "500000000",
        tenorMonths: 60,
        interestType: "EFFECTIVE",
        interestRate: "1.0",
        loanPurpose: "Pembelian Aset",
        applicationChannel: "BRANCH",
        status: "REJECTED",
        branchCode: "SBY01",
        attributes: [],
        submittedAt: new Date("2026-02-20T08:00:00Z").toISOString(),
        createdAt: new Date("2026-02-20T07:00:00Z").toISOString(),
    },
];

// Dummy parties — maps to proto: ApplicationParty
const DUMMY_APP_PARTIES: Record<string, ApplicationParty[]> = {
    "app-002": [
        {
            applicationId: "app-002",
            partyId: "party-001",
            partyType: "PERSON",
            name: "Ahmad Direktur",
            identifier: "3271000000000001",
            roleCode: "GUARANTOR",
            legalObligation: true,
            slikRequired: true,
        },
    ],
    "app-004": [
        {
            applicationId: "app-004",
            partyId: "party-002",
            partyType: "PERSON",
            name: "Dewi Penjamin",
            identifier: "3271000000000002",
            roleCode: "GUARANTOR",
            legalObligation: false,
            slikRequired: true,
        },
        {
            applicationId: "app-004",
            partyId: "party-003",
            partyType: "COMPANY",
            name: "PT Penjamin Bersama",
            identifier: "1234567890",
            roleCode: "CORPORATE_GUARANTOR",
            legalObligation: true,
            slikRequired: false,
        },
    ],
};

export const applicationService = {
    /** Maps to proto: CreateApplication */
    create: async (data: Partial<Application>) => {
        if (USE_DUMMY_DATA) {
            const newApp: Application = {
                id: `app-${Date.now()}`,
                applicantId: data.applicantId || "",
                applicantName: data.applicantName || "",
                productId: data.productId || "",
                aoId: data.aoId || "",
                loanAmount: data.loanAmount || "0",
                tenorMonths: data.tenorMonths || 0,
                interestType: data.interestType || "",
                interestRate: data.interestRate || "0",
                loanPurpose: data.loanPurpose || "",
                applicationChannel: data.applicationChannel || "",
                status: "INTAKE",
                branchCode: data.branchCode || "",
                attributes: data.attributes || [],
                submittedAt: null,
                createdAt: new Date().toISOString(),
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
                choiceId: a.choiceId,
            })) || []
        });
        return response;
    },

    /** Maps to proto: GetApplication */
    getById: async (id: string): Promise<Application | null> => {
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
                choiceId: attr.choiceId,
            })),
            createdAt: parseTimestamp(response.createdAt) || new Date().toISOString(),
            submittedAt: parseTimestamp(response.submittedAt) || null,
        };
    },

    /** Maps to proto: ListApplications */
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
                hasNext: false,
            };
        }

        const response = await client.listApplications({
            cursor: params?.cursor || "",
            pageSize: Number(params?.pageSize) || 0,
            status: params?.status || "",
            applicantId: params?.applicantId || ""
        });

        return {
            applications: (response.applications || []).map((app: any) => ({
                id: app.id || "unknown-id",
                applicantId: app.applicantId || "",
                applicantName: app.applicantName || "",
                productId: app.productId || "",
                aoId: app.aoId || "",
                loanAmount: app.loanAmount || "0",
                tenorMonths: app.tenorMonths || 0,
                interestType: app.interestType || "",
                interestRate: app.interestRate || "0",
                loanPurpose: app.loanPurpose || "",
                applicationChannel: app.applicationChannel || "",
                status: (app.status || "INTAKE") as any,
                branchCode: app.branchCode || "",
                attributes: (app.attributes || []).map((attr: any) => ({
                    attributeId: attr.attributeId,
                    value: attr.value,
                    dataType: attr.dataType,
                    choiceId: attr.choiceId,
                })),
                createdAt: parseTimestamp(app.createdAt) || new Date().toISOString(),
                submittedAt: parseTimestamp(app.submittedAt) || null,
            })),
            nextCursor: response.nextCursor || "",
            hasNext: response.hasNext || false,
        };
    },

    /** Maps to proto: ChangeApplicationStatus */
    updateStatus: async (id: string, newStatus: string, reason: string = "") => {
        if (USE_DUMMY_DATA) {
            const index = DUMMY_APPLICATIONS.findIndex(a => a.id === id);
            if (index !== -1) {
                DUMMY_APPLICATIONS[index].status = newStatus as any;
                return { ...DUMMY_APPLICATIONS[index] };
            }
            return null;
        }

        return apiClient.put(`/v1/applications/${id}/status`, {
            id,
            newStatus,
            reason,
        });
    },

    /** Maps to proto: UpdateApplication */
    update: async (id: string, data: Partial<Application>) => {
        if (USE_DUMMY_DATA) {
            const index = DUMMY_APPLICATIONS.findIndex(a => a.id === id);
            if (index !== -1) {
                DUMMY_APPLICATIONS[index] = { ...DUMMY_APPLICATIONS[index], ...data };
                return { ...DUMMY_APPLICATIONS[index] };
            }
            return null;
        }

        return client.updateApplication({
            id,
            applicantId: data.applicantId,
            productId: data.productId,
            aoId: data.aoId,
            loanAmount: data.loanAmount || "0",
            tenorMonths: data.tenorMonths || 0,
            interestType: data.interestType || "",
            interestRate: data.interestRate || "0",
            loanPurpose: data.loanPurpose || "",
            status: data.status || "",
            attributes: data.attributes?.map(a => ({
                attributeId: a.attributeId,
                value: a.value,
                dataType: a.dataType,
                choiceId: a.choiceId,
            })) || [],
        });
    },

    /** Maps to proto: ListApplicationParties */
    listParties: async (applicationId: string): Promise<ApplicationParty[]> => {
        if (USE_DUMMY_DATA) {
            return DUMMY_APP_PARTIES[applicationId] || [];
        }
        const response = await partyClient.listApplicationParties({ applicationId });
        return (response.parties || []).map((p: any) => ({
            applicationId: p.applicationId || applicationId,
            partyId: p.partyId || "",
            partyType: p.partyType || "PERSON",
            name: p.name || "",
            identifier: p.identifier || "",
            roleCode: p.roleCode || "",
            legalObligation: p.legalObligation || false,
            slikRequired: p.slikRequired || false,
        }));
    },

    /** Maps to proto: AddPartyToApplication */
    addParty: async (applicationId: string, data: {
        partyId: string;
        roleCode: string;
        slikRequired?: boolean;
    }) => {
        if (USE_DUMMY_DATA) {
            const newParty: ApplicationParty = {
                applicationId,
                partyId: data.partyId,
                partyType: "PERSON",
                name: "",
                identifier: "",
                roleCode: data.roleCode,
                legalObligation: false,
                slikRequired: data.slikRequired || false,
            };
            if (!DUMMY_APP_PARTIES[applicationId]) DUMMY_APP_PARTIES[applicationId] = [];
            DUMMY_APP_PARTIES[applicationId].push(newParty);
            return newParty;
        }
        return partyClient.addPartyToApplication({
            applicationId,
            partyId: data.partyId,
            roleCode: data.roleCode,
            slikRequired: data.slikRequired || false,
        });
    },

    /** Maps to proto: RemovePartyFromApplication */
    removeParty: async (applicationId: string, partyId: string) => {
        if (USE_DUMMY_DATA) {
            if (DUMMY_APP_PARTIES[applicationId]) {
                DUMMY_APP_PARTIES[applicationId] = DUMMY_APP_PARTIES[applicationId].filter(
                    p => p.partyId !== partyId
                );
            }
            return {};
        }
        return partyClient.removePartyFromApplication({ applicationId, partyId });
    },
};
