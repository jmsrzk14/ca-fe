import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { ReferenceService } from "@/gen/reference/v1/reference_connect";
import { Empty } from "@bufbuild/protobuf";
import {
    LoanProduct,
    Branch,
    LoanOfficer,
    ApplicationStatusRef,
    FinancialGLAccount,
    AttributeCategory,
    AttributeRegistry,
    AttributeChoice,
    Choice,
    SurveyTemplateRef,
} from "@/shared/types/api";

const client = createPromiseClient(ReferenceService, transport);

// ============================================================
// DUMMY DATA — aligned with proto: reference.proto messages
// ============================================================
const USE_DUMMY_DATA = false;

// proto: LoanProduct
const DUMMY_LOAN_PRODUCTS: LoanProduct[] = [
    { id: "prod-001", productCode: "KMK", productName: "Kredit Modal Kerja", segment: "SME", active: true },
    { id: "prod-002", productCode: "KI",  productName: "Kredit Investasi",   segment: "COMPANY", active: true },
    { id: "prod-003", productCode: "KPR", productName: "Kredit Pemilikan Rumah", segment: "RETAIL", active: true },
    { id: "prod-004", productCode: "KKB", productName: "Kredit Kendaraan Bermotor", segment: "RETAIL", active: false },
];

// proto: Branch
const DUMMY_BRANCHES: Branch[] = [
    { branchCode: "JKT01", branchName: "Jakarta Pusat",   regionCode: "WIL-JAB" },
    { branchCode: "JKT02", branchName: "Jakarta Selatan", regionCode: "WIL-JAB" },
    { branchCode: "JKT03", branchName: "Jakarta Barat",   regionCode: "WIL-JAB" },
    { branchCode: "SBY01", branchName: "Surabaya Pusat",  regionCode: "WIL-JAT" },
    { branchCode: "BDG01", branchName: "Bandung Kota",    regionCode: "WIL-JAB" },
];

// proto: LoanOfficer
const DUMMY_LOAN_OFFICERS: Record<string, LoanOfficer[]> = {
    "JKT01": [
        { id: "ao-001", officerCode: "AO-JKT01-001", branchCode: "JKT01" },
        { id: "ao-002", officerCode: "AO-JKT01-002", branchCode: "JKT01" },
    ],
    "JKT02": [
        { id: "ao-003", officerCode: "AO-JKT02-001", branchCode: "JKT02" },
    ],
    "JKT03": [
        { id: "ao-004", officerCode: "AO-JKT03-001", branchCode: "JKT03" },
    ],
    "SBY01": [
        { id: "ao-005", officerCode: "AO-SBY01-001", branchCode: "SBY01" },
    ],
    "BDG01": [
        { id: "ao-006", officerCode: "AO-BDG01-001", branchCode: "BDG01" },
    ],
};

// proto: ApplicationStatusRef
const DUMMY_APP_STATUSES: ApplicationStatusRef[] = [
    { statusCode: "INTAKE",     statusGroup: "ACTIVE",   isTerminal: false, description: "Permohonan baru masuk" },
    { statusCode: "ANALYSIS",   statusGroup: "ACTIVE",   isTerminal: false, description: "Sedang dianalisa" },
    { statusCode: "SURVEY",     statusGroup: "ACTIVE",   isTerminal: false, description: "Survey lapangan" },
    { statusCode: "COMMITTEE",  statusGroup: "ACTIVE",   isTerminal: false, description: "Rapat komite" },
    { statusCode: "APPROVED",   statusGroup: "TERMINAL", isTerminal: true,  description: "Disetujui" },
    { statusCode: "REJECTED",   statusGroup: "TERMINAL", isTerminal: true,  description: "Ditolak" },
    { statusCode: "CANCELLED",  statusGroup: "TERMINAL", isTerminal: true,  description: "Dibatalkan" },
];

// proto: FinancialGLAccount
const DUMMY_GL_ACCOUNTS: FinancialGLAccount[] = [
    { glCode: "1100", glName: "Kas",                   statementType: "NERACA",     category: "ASET_LANCAR",       sign: 1, isDebtService: false, isOperating: false, description: "Uang tunai" },
    { glCode: "1200", glName: "Piutang Usaha",         statementType: "NERACA",     category: "ASET_LANCAR",       sign: 1, isDebtService: false, isOperating: true,  description: "Tagihan ke pelanggan" },
    { glCode: "1500", glName: "Persediaan",            statementType: "NERACA",     category: "ASET_LANCAR",       sign: 1, isDebtService: false, isOperating: true,  description: "Stok barang" },
    { glCode: "2100", glName: "Hutang Usaha",          statementType: "NERACA",     category: "KEWAJIBAN_LANCAR",  sign: -1, isDebtService: false, isOperating: true, description: "Hutang ke supplier" },
    { glCode: "2200", glName: "Hutang Bank Jangka Pendek", statementType: "NERACA", category: "KEWAJIBAN_LANCAR",  sign: -1, isDebtService: true,  isOperating: false, description: "Pinjaman bank < 1 tahun" },
    { glCode: "4100", glName: "Pendapatan Penjualan",  statementType: "LABA_RUGI",  category: "PENDAPATAN",        sign: 1, isDebtService: false, isOperating: true,  description: "Omset penjualan" },
    { glCode: "5100", glName: "Harga Pokok Penjualan", statementType: "LABA_RUGI",  category: "BEBAN_POKOK",       sign: -1, isDebtService: false, isOperating: true, description: "HPP" },
    { glCode: "5200", glName: "Beban Operasional",     statementType: "LABA_RUGI",  category: "BEBAN_OPERASIONAL", sign: -1, isDebtService: false, isOperating: true, description: "Biaya overhead" },
    { glCode: "5300", glName: "Beban Bunga",           statementType: "LABA_RUGI",  category: "BEBAN_KEUANGAN",    sign: -1, isDebtService: true,  isOperating: false, description: "Biaya bunga pinjaman" },
];

// proto: AttributeCategory
const DUMMY_ATTR_CATEGORIES: AttributeCategory[] = [
    { categoryCode: "DATA_USAHA",    categoryName: "Data Usaha",        uiIcon: "briefcase",    displayOrder: 1, description: "Informasi umum usaha debitur" },
    { categoryCode: "DATA_PERSONAL", categoryName: "Data Personal",     uiIcon: "user",         displayOrder: 2, description: "Data pribadi pemohon" },
    { categoryCode: "KEUANGAN",      categoryName: "Data Keuangan",     uiIcon: "dollar-sign",  displayOrder: 3, description: "Data keuangan bisnis" },
    { categoryCode: "JAMINAN",       categoryName: "Data Jaminan",      uiIcon: "shield",       displayOrder: 4, description: "Informasi agunan/jaminan" },
    { categoryCode: "DOKUMEN",       categoryName: "Data Dokumen",      uiIcon: "file-text",    displayOrder: 5, description: "Dokumen pendukung" },
];

// proto: AttributeChoice (contoh untuk beberapa atribut)
const SECTOR_CHOICES: AttributeChoice[] = [
    { id: "ch-01", attributeId: "attr-003", code: "MFT", value: "Manufaktur",   displayOrder: 1, isActive: true },
    { id: "ch-02", attributeId: "attr-003", code: "TRD", value: "Perdagangan",  displayOrder: 2, isActive: true },
    { id: "ch-03", attributeId: "attr-003", code: "SVC", value: "Jasa",         displayOrder: 3, isActive: true },
    { id: "ch-04", attributeId: "attr-003", code: "AGR", value: "Pertanian",    displayOrder: 4, isActive: true },
];

// proto: AttributeRegistry
const DUMMY_ATTR_REGISTRY: AttributeRegistry[] = [
    {
        id: "attr-001", attributeCode: "PEKERJAAN",     appliesTo: "PERSONAL", scope: "APPLICANT",
        dataType: "STRING",  categoryCode: "DATA_PERSONAL", uiLabel: "Pekerjaan",
        isRequired: true,  riskRelevant: false, isActive: true, hideOnCreate: false, displayOrder: 1,
        description: "Jenis pekerjaan pemohon", categoryName: "Data Personal", categoryIcon: "user", choices: [],
    },
    {
        id: "attr-002", attributeCode: "LAMA_USAHA",    appliesTo: "PERSONAL", scope: "APPLICANT",
        dataType: "NUMBER",  categoryCode: "DATA_USAHA",    uiLabel: "Lama Usaha (Tahun)",
        isRequired: true,  riskRelevant: true,  isActive: true, hideOnCreate: false, displayOrder: 2,
        description: "Sudah berapa tahun usaha berjalan", categoryName: "Data Usaha", categoryIcon: "briefcase", choices: [],
    },
    {
        id: "attr-003", attributeCode: "SEKTOR_USAHA",  appliesTo: "COMPANY", scope: "APPLICANT",
        dataType: "SELECT",  categoryCode: "DATA_USAHA",    uiLabel: "Sektor Usaha",
        isRequired: true,  riskRelevant: true,  isActive: true, hideOnCreate: false, displayOrder: 1,
        description: "Sektor industri perusahaan", categoryName: "Data Usaha", categoryIcon: "briefcase", choices: SECTOR_CHOICES,
    },
    {
        id: "attr-004", attributeCode: "JML_KARYAWAN",  appliesTo: "COMPANY", scope: "APPLICANT",
        dataType: "NUMBER",  categoryCode: "DATA_USAHA",    uiLabel: "Jumlah Karyawan",
        isRequired: false, riskRelevant: false, isActive: true, hideOnCreate: false, displayOrder: 2,
        description: "Total karyawan tetap", categoryName: "Data Usaha", categoryIcon: "briefcase", choices: [],
    },
    {
        id: "attr-005", attributeCode: "TUJUAN_PENGGUNAAN", appliesTo: "BOTH", scope: "APPLICATION",
        dataType: "STRING",  categoryCode: "DATA_USAHA",    uiLabel: "Tujuan Penggunaan Dana",
        isRequired: true,  riskRelevant: false, isActive: true, hideOnCreate: false, displayOrder: 3,
        description: "Rincian penggunaan dana kredit", categoryName: "Data Usaha", categoryIcon: "briefcase", choices: [],
    },
    {
        id: "attr-006", attributeCode: "FOTO_USAHA",    appliesTo: "BOTH", scope: "APPLICATION",
        dataType: "STRING",  categoryCode: "DOKUMEN",       uiLabel: "Foto Tempat Usaha (URL)",
        isRequired: false, riskRelevant: false, isActive: true, hideOnCreate: true, displayOrder: 1,
        description: "URL foto tempat usaha dari survey", categoryName: "Data Dokumen", categoryIcon: "file-text", choices: [],
    },
];

// proto: SurveyTemplate (reference service — lighter version)
const DUMMY_SURVEY_TEMPLATES_REF: SurveyTemplateRef[] = [
    { id: "tmpl-001", templateCode: "SURVEY-SME",    templateName: "Survey UMK",           applicantType: "PERSONAL", productId: "prod-001" },
    { id: "tmpl-002", templateCode: "SURVEY-CORP",   templateName: "Survey Korporasi",     applicantType: "COMPANY",  productId: "prod-002" },
    { id: "tmpl-003", templateCode: "SURVEY-PROPERTY",templateName: "Survey Properti KPR", applicantType: "PERSONAL", productId: "prod-003" },
];

// proto: Choice (Provinces)
const DUMMY_PROVINCES: Choice[] = [
    { code: "11", value: "Aceh" },
    { code: "12", value: "Sumatera Utara" },
    { code: "31", value: "DKI Jakarta" },
    { code: "32", value: "Jawa Barat" },
    { code: "33", value: "Jawa Tengah" },
    { code: "34", value: "DI Yogyakarta" },
    { code: "35", value: "Jawa Timur" },
    { code: "36", value: "Banten" },
    { code: "51", value: "Bali" },
    { code: "63", value: "Kalimantan Selatan" },
    { code: "73", value: "Sulawesi Selatan" },
];

// proto: Choice (Cities)
const DUMMY_CITIES: Choice[] = [
    { code: "3101", value: "Kepulauan Seribu" },
    { code: "3171", value: "Kota Jakarta Selatan" },
    { code: "3172", value: "Kota Jakarta Timur" },
    { code: "3173", value: "Kota Jakarta Pusat" },
    { code: "3174", value: "Kota Jakarta Barat" },
    { code: "3175", value: "Kota Jakarta Utara" },
    { code: "3201", value: "Bogor" },
    { code: "3271", value: "Kota Bogor" },
    { code: "3578", value: "Kota Surabaya" },
    { code: "3273", value: "Kota Bandung" },
];

export const referenceService = {
    /** Maps to proto: ListLoanProducts */
    getLoanProducts: async (): Promise<{ products: LoanProduct[] }> => {
        if (USE_DUMMY_DATA) return { products: DUMMY_LOAN_PRODUCTS };
        const r = await client.listLoanProducts(new Empty());
        return { products: (r.products || []).map((p: any) => ({
            id: p.id, productCode: p.productCode, productName: p.productName, segment: p.segment, active: p.active,
        })) };
    },

    /** Maps to proto: GetLoanProduct */
    getLoanProduct: async (id: string): Promise<LoanProduct | null> => {
        if (USE_DUMMY_DATA) return DUMMY_LOAN_PRODUCTS.find(p => p.id === id) || null;
        return client.getLoanProduct({ id }) as any;
    },

    /** Maps to proto: ListBranches */
    getBranches: async (): Promise<{ branches: Branch[] }> => {
        if (USE_DUMMY_DATA) return { branches: DUMMY_BRANCHES };
        const r = await client.listBranches(new Empty());
        return { branches: (r.branches || []).map((b: any) => ({
            branchCode: b.branchCode, branchName: b.branchName, regionCode: b.regionCode,
        })) };
    },

    /** Maps to proto: ListLoanOfficers */
    listLoanOfficers: async (branchCode: string): Promise<{ officers: LoanOfficer[] }> => {
        if (USE_DUMMY_DATA) return { officers: DUMMY_LOAN_OFFICERS[branchCode] || [] };
        const r = await client.listLoanOfficers({ branchCode });
        return { officers: (r.officers || []).map((o: any) => ({
            id: o.id, officerCode: o.officerCode, branchCode: o.branchCode,
        })) };
    },

    /** Maps to proto: ListApplicationStatuses */
    listApplicationStatuses: async (): Promise<{ statuses: ApplicationStatusRef[] }> => {
        if (USE_DUMMY_DATA) return { statuses: DUMMY_APP_STATUSES };
        const r = await client.listApplicationStatuses(new Empty());
        return { statuses: (r.statuses || []).map((s: any) => ({
            statusCode: s.statusCode, statusGroup: s.statusGroup, isTerminal: s.isTerminal, description: s.description,
        })) };
    },

    /** Maps to proto: ListFinancialGLAccounts */
    getGLAccounts: async (): Promise<{ accounts: FinancialGLAccount[] }> => {
        if (USE_DUMMY_DATA) return { accounts: DUMMY_GL_ACCOUNTS };
        const r = await client.listFinancialGLAccounts(new Empty());
        return { accounts: (r.accounts || []).map((a: any) => ({
            glCode: a.glCode, glName: a.glName, statementType: a.statementType,
            category: a.category, sign: a.sign, isDebtService: a.isDebtService,
            isOperating: a.isOperating, description: a.description,
        })) };
    },

    /** Maps to proto: ListAttributeCategories */
    listAttributeCategories: async (): Promise<{ categories: AttributeCategory[] }> => {
        if (USE_DUMMY_DATA) return { categories: DUMMY_ATTR_CATEGORIES };
        const r = await client.listAttributeCategories(new Empty());
        return { categories: (r.categories || []).map((c: any) => ({
            categoryCode: c.categoryCode, categoryName: c.categoryName,
            uiIcon: c.uiIcon, displayOrder: c.displayOrder, description: c.description,
        })) };
    },

    /** Maps to proto: GetAttributeCategory */
    getAttributeCategory: async (categoryCode: string): Promise<AttributeCategory | null> => {
        if (USE_DUMMY_DATA) return DUMMY_ATTR_CATEGORIES.find(c => c.categoryCode === categoryCode) || null;
        return client.getAttributeCategory({ categoryCode }) as any;
    },

    /** Maps to proto: CreateAttributeCategory */
    createAttributeCategory: async (data: Omit<AttributeCategory, never>): Promise<AttributeCategory> => {
        if (USE_DUMMY_DATA) {
            DUMMY_ATTR_CATEGORIES.push(data);
            return data;
        }
        return client.createAttributeCategory(data as any) as any;
    },

    /** Maps to proto: UpdateAttributeCategory */
    updateAttributeCategory: async (data: AttributeCategory): Promise<AttributeCategory> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_ATTR_CATEGORIES.findIndex(c => c.categoryCode === data.categoryCode);
            if (idx !== -1) DUMMY_ATTR_CATEGORIES[idx] = data;
            return data;
        }
        return client.updateAttributeCategory(data as any) as any;
    },

    /** Maps to proto: DeleteAttributeCategory */
    deleteAttributeCategory: async (categoryCode: string): Promise<void> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_ATTR_CATEGORIES.findIndex(c => c.categoryCode === categoryCode);
            if (idx !== -1) DUMMY_ATTR_CATEGORIES.splice(idx, 1);
            return;
        }
        await client.deleteAttributeCategory({ categoryCode });
    },

    /** Maps to proto: ListAttributeRegistry */
    getAttributeRegistry: async (): Promise<{ attributes: AttributeRegistry[] }> => {
        if (USE_DUMMY_DATA) return { attributes: DUMMY_ATTR_REGISTRY };
        const r = await client.listAttributeRegistry(new Empty());
        return { attributes: r.attributes as any };
    },

    /** Maps to proto: ListAttributeRegistryByCategory */
    listAttributeRegistryByCategory: async (categoryCode: string): Promise<{ attributes: AttributeRegistry[] }> => {
        if (USE_DUMMY_DATA) return { attributes: DUMMY_ATTR_REGISTRY.filter(a => a.categoryCode === categoryCode) };
        const r = await client.listAttributeRegistryByCategory({ categoryCode });
        return { attributes: r.attributes as any };
    },

    /** Maps to proto: CreateAttributeRegistry */
    createAttributeRegistry: async (data: any): Promise<void> => {
        if (USE_DUMMY_DATA) {
            DUMMY_ATTR_REGISTRY.push({ ...data, id: `attr-${Date.now()}`, choices: [], categoryName: '', categoryIcon: '' });
            return;
        }
        await client.createAttributeRegistry(data);
    },

    /** Maps to proto: UpdateAttributeRegistry */
    updateAttributeRegistry: async (data: any): Promise<void> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_ATTR_REGISTRY.findIndex(a => a.id === data.id);
            if (idx !== -1) DUMMY_ATTR_REGISTRY[idx] = { ...DUMMY_ATTR_REGISTRY[idx], ...data };
            return;
        }
        await client.updateAttributeRegistry(data);
    },

    /** Maps to proto: DeleteAttributeRegistry */
    deleteAttributeRegistry: async (id: string): Promise<void> => {
        if (USE_DUMMY_DATA) {
            const idx = DUMMY_ATTR_REGISTRY.findIndex(a => a.id === id);
            if (idx !== -1) DUMMY_ATTR_REGISTRY.splice(idx, 1);
            return;
        }
        await client.deleteAttributeRegistry({ id });
    },

    /** Maps to proto: ListSurveyTemplates (reference service) */
    listSurveyTemplates: async (params?: { applicantType?: string; productId?: string }): Promise<{ templates: SurveyTemplateRef[] }> => {
        if (USE_DUMMY_DATA) {
            let filtered = [...DUMMY_SURVEY_TEMPLATES_REF];
            if (params?.applicantType) filtered = filtered.filter(t => t.applicantType === params.applicantType);
            if (params?.productId) filtered = filtered.filter(t => t.productId === params.productId);
            return { templates: filtered };
        }
        const r = await client.listSurveyTemplates({
            applicantType: params?.applicantType || '',
            productId: params?.productId || '',
        });
        return { templates: r.templates as any };
    },

    /** Maps to proto: ListProvinces */
    listProvinces: async (): Promise<{ provinces: Choice[] }> => {
        if (USE_DUMMY_DATA) return { provinces: DUMMY_PROVINCES };
        const r = await client.listProvinces(new Empty());
        return { provinces: (r.provinces || []).map((p: any) => ({ code: p.code, value: p.value })) };
    },

    /** Maps to proto: ListCities */
    listCities: async (): Promise<{ cities: Choice[] }> => {
        if (USE_DUMMY_DATA) return { cities: DUMMY_CITIES };
        const r = await client.listCities(new Empty());
        return { cities: (r.cities || []).map((c: any) => ({ code: c.code, value: c.value })) };
    },

    /** Maps to proto: CreateAttributeChoice */
    createAttributeChoice: async (data: any): Promise<void> => {
        if (USE_DUMMY_DATA) return;
        await client.createAttributeChoice(data);
    },

    /** Maps to proto: UpdateAttributeChoice */
    updateAttributeChoice: async (data: any): Promise<void> => {
        if (USE_DUMMY_DATA) return;
        await client.updateAttributeChoice(data);
    },

    /** Maps to proto: DeleteAttributeChoice */
    deleteAttributeChoice: async (id: string): Promise<void> => {
        if (USE_DUMMY_DATA) return;
        await client.deleteAttributeChoice({ id });
    },
};
