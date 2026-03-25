import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { FinancialService } from "@/gen/financial/v1/financial_connect";
import { FinancialFact, Asset, Liability, FinancialRatio } from "@/shared/types/api";

const client = createPromiseClient(FinancialService, transport);

function parseTimestamp(ts: any): string | undefined {
    if (!ts) return undefined;
    if (typeof ts === 'string') return ts;
    if (ts.seconds !== undefined) {
        try { return new Date(Number(ts.seconds) * 1000).toISOString(); } catch { return undefined; }
    }
    try {
        const d = new Date(ts);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
    } catch { return undefined; }
}

// ============================================================
// DUMMY DATA — aligned with proto: financial.proto messages
// ============================================================
const USE_DUMMY_DATA = false;

// proto: ApplicationFinancialFact
const DUMMY_FINANCIAL_FACTS: Record<string, FinancialFact[]> = {
    "app-001": [
        { id: "ff-001", applicationId: "app-001", glCode: "4100", periodType: "ANNUAL", periodLabel: "2024", amount: "180000000", source: "SELF_DECLARED", confidenceLevel: "MEDIUM", createdAt: new Date("2026-03-01T10:00:00Z").toISOString() },
        { id: "ff-002", applicationId: "app-001", glCode: "5100", periodType: "ANNUAL", periodLabel: "2024", amount: "120000000", source: "SELF_DECLARED", confidenceLevel: "MEDIUM", createdAt: new Date("2026-03-01T10:00:00Z").toISOString() },
        { id: "ff-003", applicationId: "app-001", glCode: "5200", periodType: "ANNUAL", periodLabel: "2024", amount: "25000000",  source: "SELF_DECLARED", confidenceLevel: "LOW",    createdAt: new Date("2026-03-01T10:00:00Z").toISOString() },
        { id: "ff-004", applicationId: "app-001", glCode: "1100", periodType: "ANNUAL", periodLabel: "2024", amount: "15000000",  source: "SELF_DECLARED", confidenceLevel: "HIGH",   createdAt: new Date("2026-03-01T10:00:00Z").toISOString() },
    ],
    "app-002": [
        { id: "ff-005", applicationId: "app-002", glCode: "4100", periodType: "ANNUAL", periodLabel: "2024", amount: "5000000000",  source: "AUDITED",       confidenceLevel: "HIGH",   createdAt: new Date("2026-03-05T10:00:00Z").toISOString() },
        { id: "ff-006", applicationId: "app-002", glCode: "4100", periodType: "ANNUAL", periodLabel: "2023", amount: "4200000000",  source: "AUDITED",       confidenceLevel: "HIGH",   createdAt: new Date("2026-03-05T10:00:00Z").toISOString() },
        { id: "ff-007", applicationId: "app-002", glCode: "5100", periodType: "ANNUAL", periodLabel: "2024", amount: "3500000000",  source: "AUDITED",       confidenceLevel: "HIGH",   createdAt: new Date("2026-03-05T10:00:00Z").toISOString() },
        { id: "ff-008", applicationId: "app-002", glCode: "5200", periodType: "ANNUAL", periodLabel: "2024", amount: "750000000",   source: "AUDITED",       confidenceLevel: "HIGH",   createdAt: new Date("2026-03-05T10:00:00Z").toISOString() },
        { id: "ff-009", applicationId: "app-002", glCode: "2200", periodType: "ANNUAL", periodLabel: "2024", amount: "1200000000",  source: "SLIK",          confidenceLevel: "HIGH",   createdAt: new Date("2026-03-05T10:00:00Z").toISOString() },
        { id: "ff-010", applicationId: "app-002", glCode: "1200", periodType: "ANNUAL", periodLabel: "2024", amount: "800000000",   source: "AUDITED",       confidenceLevel: "HIGH",   createdAt: new Date("2026-03-05T10:00:00Z").toISOString() },
    ],
    "app-004": [
        { id: "ff-011", applicationId: "app-004", glCode: "4100", periodType: "ANNUAL", periodLabel: "2024", amount: "350000000",  source: "SELF_DECLARED", confidenceLevel: "MEDIUM", createdAt: new Date("2026-03-15T10:00:00Z").toISOString() },
        { id: "ff-012", applicationId: "app-004", glCode: "5100", periodType: "ANNUAL", periodLabel: "2024", amount: "200000000",  source: "SELF_DECLARED", confidenceLevel: "MEDIUM", createdAt: new Date("2026-03-15T10:00:00Z").toISOString() },
    ],
};

// proto: ApplicationAsset
const DUMMY_ASSETS: Record<string, Asset[]> = {
    "app-001": [
        { id: "ast-001", applicationId: "app-001", assetTypeCode: "KENDARAAN", assetName: "Mobil Toyota Innova 2020", ownershipStatus: "OWNED", acquisitionYear: 2020, estimatedValue: "280000000", valuationMethod: "MARKET", locationText: "Jakarta Selatan", encumbered: false },
    ],
    "app-002": [
        { id: "ast-002", applicationId: "app-002", assetTypeCode: "TANAH",     assetName: "Tanah Industri Cikampek 5000m2", ownershipStatus: "OWNED", acquisitionYear: 2015, estimatedValue: "8000000000", valuationMethod: "APPRAISAL", locationText: "Cikampek, Karawang", encumbered: true },
        { id: "ast-003", applicationId: "app-002", assetTypeCode: "BANGUNAN",  assetName: "Gedung Pabrik 3000m2", ownershipStatus: "OWNED", acquisitionYear: 2016, estimatedValue: "4500000000", valuationMethod: "APPRAISAL", locationText: "Cikampek, Karawang", encumbered: true },
        { id: "ast-004", applicationId: "app-002", assetTypeCode: "MESIN",     assetName: "Mesin Produksi CNC", ownershipStatus: "OWNED", acquisitionYear: 2021, estimatedValue: "1200000000", valuationMethod: "MARKET", locationText: "Cikampek, Karawang", encumbered: false },
    ],
    "app-004": [
        { id: "ast-005", applicationId: "app-004", assetTypeCode: "TANAH",     assetName: "Rumah Tinggal Jaksel 200m2", ownershipStatus: "OWNED", acquisitionYear: 2010, estimatedValue: "2500000000", valuationMethod: "APPRAISAL", locationText: "Jakarta Selatan", encumbered: false },
    ],
};

// proto: ApplicationLiability
const DUMMY_LIABILITIES: Record<string, Liability[]> = {
    "app-001": [
        { id: "lib-001", applicationId: "app-001", creditorName: "Bank XYZ",  liabilityType: "KTA",    outstandingAmount: "20000000",  monthlyInstallment: "1800000", interestRate: "12.5", maturityDate: "2026-12-01", source: "SELF_DECLARED" },
    ],
    "app-002": [
        { id: "lib-002", applicationId: "app-002", creditorName: "Bank ABC",  liabilityType: "KI",     outstandingAmount: "1500000000", monthlyInstallment: "45000000", interestRate: "9.5",  maturityDate: "2028-06-01", source: "SLIK" },
        { id: "lib-003", applicationId: "app-002", creditorName: "Leasing XYZ", liabilityType: "LEASING", outstandingAmount: "350000000", monthlyInstallment: "12000000", interestRate: "11.0", maturityDate: "2027-03-01", source: "SLIK" },
    ],
    "app-005": [
        { id: "lib-004", applicationId: "app-005", creditorName: "Bank Swasta A", liabilityType: "KMK",  outstandingAmount: "800000000", monthlyInstallment: "28000000", interestRate: "10.5", maturityDate: "2027-08-01", source: "SLIK" },
        { id: "lib-005", applicationId: "app-005", creditorName: "Bank Swasta B", liabilityType: "KMK",  outstandingAmount: "500000000", monthlyInstallment: "20000000", interestRate: "11.0", maturityDate: "2026-10-01", source: "SLIK" },
    ],
};

// proto: FinancialRatio
const DUMMY_RATIOS: Record<string, FinancialRatio[]> = {
    "app-001": [
        { id: "rat-001", applicationId: "app-001", ratioCode: "GPM",  ratioValue: "0.33",  calculationVersion: "v1", calculatedAt: new Date("2026-03-02T08:00:00Z").toISOString() },
        { id: "rat-002", applicationId: "app-001", ratioCode: "NPM",  ratioValue: "0.19",  calculationVersion: "v1", calculatedAt: new Date("2026-03-02T08:00:00Z").toISOString() },
        { id: "rat-003", applicationId: "app-001", ratioCode: "DSCR", ratioValue: "1.85",  calculationVersion: "v1", calculatedAt: new Date("2026-03-02T08:00:00Z").toISOString() },
    ],
    "app-002": [
        { id: "rat-004", applicationId: "app-002", ratioCode: "GPM",  ratioValue: "0.30",  calculationVersion: "v1", calculatedAt: new Date("2026-03-06T08:00:00Z").toISOString() },
        { id: "rat-005", applicationId: "app-002", ratioCode: "NPM",  ratioValue: "0.15",  calculationVersion: "v1", calculatedAt: new Date("2026-03-06T08:00:00Z").toISOString() },
        { id: "rat-006", applicationId: "app-002", ratioCode: "DER",  ratioValue: "0.42",  calculationVersion: "v1", calculatedAt: new Date("2026-03-06T08:00:00Z").toISOString() },
        { id: "rat-007", applicationId: "app-002", ratioCode: "DSCR", ratioValue: "2.54",  calculationVersion: "v1", calculatedAt: new Date("2026-03-06T08:00:00Z").toISOString() },
        { id: "rat-008", applicationId: "app-002", ratioCode: "CR",   ratioValue: "1.82",  calculationVersion: "v1", calculatedAt: new Date("2026-03-06T08:00:00Z").toISOString() },
    ],
};

export const financialService = {
    /** Maps to proto: UpsertFinancialFact */
    upsertFact: async (applicationId: string, data: Omit<FinancialFact, 'id' | 'applicationId' | 'createdAt'>): Promise<FinancialFact> => {
        if (USE_DUMMY_DATA) {
            if (!DUMMY_FINANCIAL_FACTS[applicationId]) DUMMY_FINANCIAL_FACTS[applicationId] = [];
            const existing = DUMMY_FINANCIAL_FACTS[applicationId].findIndex(
                f => f.glCode === data.glCode && f.periodLabel === data.periodLabel
            );
            const fact: FinancialFact = { id: existing !== -1 ? DUMMY_FINANCIAL_FACTS[applicationId][existing].id : `ff-${Date.now()}`, applicationId, ...data, createdAt: new Date().toISOString() };
            if (existing !== -1) DUMMY_FINANCIAL_FACTS[applicationId][existing] = fact;
            else DUMMY_FINANCIAL_FACTS[applicationId].push(fact);
            return fact;
        }
        const response = await client.upsertFinancialFact({
            applicationId, glCode: data.glCode, periodType: data.periodType,
            periodLabel: data.periodLabel, amount: data.amount, source: data.source, confidenceLevel: data.confidenceLevel,
        });
        return { id: response.id, applicationId: response.applicationId, glCode: response.glCode, periodType: response.periodType, periodLabel: response.periodLabel, amount: response.amount, source: response.source, confidenceLevel: response.confidenceLevel, createdAt: parseTimestamp(response.createdAt) };
    },

    /** Maps to proto: ListFinancialFacts */
    getFinancialFacts: async (applicationId: string): Promise<FinancialFact[]> => {
        if (USE_DUMMY_DATA) return DUMMY_FINANCIAL_FACTS[applicationId] || [];
        const response = await client.listFinancialFacts({ applicationId });
        return (response.facts || []).map((f: any) => ({
            id: f.id, applicationId: f.applicationId, glCode: f.glCode, periodType: f.periodType,
            periodLabel: f.periodLabel, amount: f.amount, source: f.source, confidenceLevel: f.confidenceLevel,
            createdAt: parseTimestamp(f.createdAt),
        }));
    },

    /** Maps to proto: AddAsset */
    addAsset: async (applicationId: string, data: Omit<Asset, 'id' | 'applicationId'>): Promise<Asset> => {
        if (USE_DUMMY_DATA) {
            const newAsset: Asset = { id: `ast-${Date.now()}`, applicationId, ...data };
            if (!DUMMY_ASSETS[applicationId]) DUMMY_ASSETS[applicationId] = [];
            DUMMY_ASSETS[applicationId].push(newAsset);
            return newAsset;
        }
        const response = await client.addAsset({
            applicationId, assetTypeCode: data.assetTypeCode, assetName: data.assetName,
            ownershipStatus: data.ownershipStatus, acquisitionYear: data.acquisitionYear,
            estimatedValue: data.estimatedValue, valuationMethod: data.valuationMethod,
            locationText: data.locationText, encumbered: data.encumbered,
        });
        return { id: response.id, applicationId: response.applicationId, assetTypeCode: response.assetTypeCode, assetName: response.assetName, ownershipStatus: response.ownershipStatus, acquisitionYear: response.acquisitionYear, estimatedValue: response.estimatedValue, valuationMethod: response.valuationMethod, locationText: response.locationText, encumbered: response.encumbered };
    },

    /** Maps to proto: UpdateAsset */
    updateAsset: async (applicationId: string, id: string, data: Partial<Asset>): Promise<Asset | null> => {
        if (USE_DUMMY_DATA) {
            const assets = DUMMY_ASSETS[applicationId] || [];
            const idx = assets.findIndex(a => a.id === id);
            if (idx !== -1) { assets[idx] = { ...assets[idx], ...data }; return assets[idx]; }
            return null;
        }
        return client.updateAsset({ id, applicationId, ...data } as any) as any;
    },

    /** Maps to proto: ListAssetsByApplication */
    getAssets: async (applicationId: string): Promise<Asset[]> => {
        if (USE_DUMMY_DATA) return DUMMY_ASSETS[applicationId] || [];
        const response = await client.listAssetsByApplication({ applicationId });
        return (response.assets || []).map((a: any) => ({
            id: a.id, applicationId: a.applicationId, assetTypeCode: a.assetTypeCode, assetName: a.assetName,
            ownershipStatus: a.ownershipStatus, acquisitionYear: a.acquisitionYear, estimatedValue: a.estimatedValue,
            valuationMethod: a.valuationMethod, locationText: a.locationText, encumbered: a.encumbered,
        }));
    },

    /** Maps to proto: AddLiability */
    addLiability: async (applicationId: string, data: Omit<Liability, 'id' | 'applicationId'>): Promise<Liability> => {
        if (USE_DUMMY_DATA) {
            const newLiability: Liability = { id: `lib-${Date.now()}`, applicationId, ...data };
            if (!DUMMY_LIABILITIES[applicationId]) DUMMY_LIABILITIES[applicationId] = [];
            DUMMY_LIABILITIES[applicationId].push(newLiability);
            return newLiability;
        }
        const response = await client.addLiability({
            applicationId, creditorName: data.creditorName, liabilityType: data.liabilityType,
            outstandingAmount: data.outstandingAmount, monthlyInstallment: data.monthlyInstallment,
            interestRate: data.interestRate, maturityDate: data.maturityDate, source: data.source,
        });
        return { id: response.id, applicationId: response.applicationId, creditorName: response.creditorName, liabilityType: response.liabilityType, outstandingAmount: response.outstandingAmount, monthlyInstallment: response.monthlyInstallment, interestRate: response.interestRate, maturityDate: response.maturityDate, source: response.source };
    },

    /** Maps to proto: UpdateLiability */
    updateLiability: async (applicationId: string, id: string, data: Partial<Liability>): Promise<Liability | null> => {
        if (USE_DUMMY_DATA) {
            const liabilities = DUMMY_LIABILITIES[applicationId] || [];
            const idx = liabilities.findIndex(l => l.id === id);
            if (idx !== -1) { liabilities[idx] = { ...liabilities[idx], ...data }; return liabilities[idx]; }
            return null;
        }
        return client.updateLiability({ id, applicationId, ...data } as any) as any;
    },

    /** Maps to proto: ListLiabilitiesByApplication */
    getLiabilities: async (applicationId: string): Promise<Liability[]> => {
        if (USE_DUMMY_DATA) return DUMMY_LIABILITIES[applicationId] || [];
        const response = await client.listLiabilitiesByApplication({ applicationId });
        return (response.liabilities || []).map((l: any) => ({
            id: l.id, applicationId: l.applicationId, creditorName: l.creditorName,
            liabilityType: l.liabilityType, outstandingAmount: l.outstandingAmount,
            monthlyInstallment: l.monthlyInstallment, interestRate: l.interestRate,
            maturityDate: l.maturityDate, source: l.source,
        }));
    },

    /** Maps to proto: CalculateFinancialRatios */
    calculateRatios: async (applicationId: string): Promise<FinancialRatio[]> => {
        if (USE_DUMMY_DATA) return DUMMY_RATIOS[applicationId] || [];
        const response = await client.calculateFinancialRatios({ applicationId });
        return (response.ratios || []).map((r: any) => ({
            id: r.id, applicationId: r.applicationId, ratioCode: r.ratioCode,
            ratioValue: r.ratioValue, calculationVersion: r.calculationVersion,
            calculatedAt: parseTimestamp(r.calculatedAt),
        }));
    },

    /** Shorthand alias for getFinancialFacts */
    getFinancialData: async (applicationId: string) => ({
        facts: await financialService.getFinancialFacts(applicationId),
        assets: await financialService.getAssets(applicationId),
        liabilities: await financialService.getLiabilities(applicationId),
        ratios: DUMMY_RATIOS[applicationId] || [],
    }),
};
