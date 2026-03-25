import { createPromiseClient } from "@connectrpc/connect";
import { transport } from "../grpc-client";
import { CommitteeService, DecisionService } from "@/gen/decision/v1/decision_connect";
import {
    CommitteeSession,
    CommitteeVote,
    CommitteeDecision,
    ApplicationDecision,
    DecisionCondition,
} from "@/shared/types/api";

const committeeClient = createPromiseClient(CommitteeService, transport);
const decisionClient = createPromiseClient(DecisionService, transport);

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
// DUMMY DATA — aligned with proto: decision.proto messages
// ============================================================
const USE_DUMMY_DATA = false;

// proto: CommitteeSession
const DUMMY_SESSIONS: CommitteeSession[] = [
    {
        id: "sess-001",
        applicationId: "app-004",
        sessionSequence: 1,
        status: "COMPLETED",
        scheduledAt: new Date("2026-03-18T09:00:00Z").toISOString(),
        startedAt: new Date("2026-03-18T09:10:00Z").toISOString(),
        completedAt: new Date("2026-03-18T11:00:00Z").toISOString(),
    },
    {
        id: "sess-002",
        applicationId: "app-004",
        sessionSequence: 2,
        status: "SCHEDULED",
        scheduledAt: new Date("2026-03-25T10:00:00Z").toISOString(),
        startedAt: undefined,
        completedAt: undefined,
    },
    {
        id: "sess-003",
        applicationId: "app-002",
        sessionSequence: 1,
        status: "COMPLETED",
        scheduledAt: new Date("2026-03-12T08:00:00Z").toISOString(),
        startedAt: new Date("2026-03-12T08:15:00Z").toISOString(),
        completedAt: new Date("2026-03-12T10:30:00Z").toISOString(),
    },
];

// proto: CommitteeVote
const DUMMY_VOTES: Record<string, CommitteeVote[]> = {
    "sess-001": [
        {
            id: "vote-001",
            committeeSessionId: "sess-001",
            userId: "usr-001",
            vote: "APPROVE",
            voteReason: "Keuangan pemohon memenuhi syarat",
            votedAt: new Date("2026-03-18T10:00:00Z").toISOString(),
        },
        {
            id: "vote-002",
            committeeSessionId: "sess-001",
            userId: "usr-002",
            vote: "APPROVE",
            voteReason: "Agunan memadai",
            votedAt: new Date("2026-03-18T10:15:00Z").toISOString(),
        },
        {
            id: "vote-003",
            committeeSessionId: "sess-001",
            userId: "usr-003",
            vote: "REJECT",
            voteReason: "Rasio hutang terlalu tinggi",
            votedAt: new Date("2026-03-18T10:30:00Z").toISOString(),
        },
    ],
    "sess-003": [
        {
            id: "vote-004",
            committeeSessionId: "sess-003",
            userId: "usr-001",
            vote: "APPROVE",
            voteReason: "Profil bisnis baik",
            votedAt: new Date("2026-03-12T09:00:00Z").toISOString(),
        },
        {
            id: "vote-005",
            committeeSessionId: "sess-003",
            userId: "usr-004",
            vote: "APPROVE",
            voteReason: "Laporan keuangan positif",
            votedAt: new Date("2026-03-12T09:30:00Z").toISOString(),
        },
    ],
};

// proto: CommitteeDecision
const DUMMY_COMMITTEE_DECISIONS: Record<string, CommitteeDecision> = {
    "sess-001": {
        id: "cdec-001",
        committeeSessionId: "sess-001",
        decision: "APPROVE",
        decisionReason: "Mayoritas voting menyetujui dengan catatan",
        approvedAmount: "80000000",
        approvedTenor: 18,
        approvedInterestRate: "1.0",
        requiresNextCommittee: true,
        decidedAt: new Date("2026-03-18T11:00:00Z").toISOString(),
    },
    "sess-003": {
        id: "cdec-002",
        committeeSessionId: "sess-003",
        decision: "APPROVE",
        decisionReason: "Semua anggota menyetujui",
        approvedAmount: "250000000",
        approvedTenor: 36,
        approvedInterestRate: "1.2",
        requiresNextCommittee: false,
        decidedAt: new Date("2026-03-12T10:30:00Z").toISOString(),
    },
};

// proto: ApplicationDecision
const DUMMY_APP_DECISIONS: Record<string, ApplicationDecision> = {
    "app-002": {
        id: "adec-001",
        applicationId: "app-002",
        decision: "APPROVED",
        decisionSource: "COMMITTEE",
        finalAmount: "250000000",
        finalTenor: 36,
        finalInterestRate: "1.2",
        decisionReason: "Memenuhi semua persyaratan kredit",
        decidedBy: "usr-001",
        decidedAt: new Date("2026-03-12T11:00:00Z").toISOString(),
    },
    "app-005": {
        id: "adec-002",
        applicationId: "app-005",
        decision: "REJECTED",
        decisionSource: "COMMITTEE",
        finalAmount: "0",
        finalTenor: 0,
        finalInterestRate: "0",
        decisionReason: "Rasio keuangan tidak memenuhi threshold",
        decidedBy: "usr-002",
        decidedAt: new Date("2026-02-25T10:00:00Z").toISOString(),
    },
};

// proto: DecisionCondition
const DUMMY_CONDITIONS: Record<string, DecisionCondition[]> = {
    "app-002": [
        {
            id: "cond-001",
            applicationId: "app-002",
            conditionText: "Melampirkan laporan keuangan 3 tahun terakhir",
            isMet: true,
            createdAt: new Date("2026-03-12T11:05:00Z").toISOString(),
        },
        {
            id: "cond-002",
            applicationId: "app-002",
            conditionText: "Membuka rekening di bank kami",
            isMet: false,
            createdAt: new Date("2026-03-12T11:05:00Z").toISOString(),
        },
    ],
    "app-004": [
        {
            id: "cond-003",
            applicationId: "app-004",
            conditionText: "Melampirkan sertifikat jaminan",
            isMet: false,
            createdAt: new Date("2026-03-18T11:05:00Z").toISOString(),
        },
    ],
};

export const decisionService = {
    // ---- Committee Service methods ----

    /** Maps to proto: CreateCommitteeSession */
    createSession: async (data: {
        applicationId: string;
        sessionSequence: number;
        scheduledAt: string;
    }): Promise<CommitteeSession> => {
        if (USE_DUMMY_DATA) {
            const newSession: CommitteeSession = {
                id: `sess-${Date.now()}`,
                applicationId: data.applicationId,
                sessionSequence: data.sessionSequence,
                status: "SCHEDULED",
                scheduledAt: data.scheduledAt,
                startedAt: undefined,
                completedAt: undefined,
            };
            DUMMY_SESSIONS.push(newSession);
            return newSession;
        }
        const response = await committeeClient.createCommitteeSession({
            applicationId: data.applicationId,
            sessionSequence: data.sessionSequence,
            scheduledAt: data.scheduledAt as any,
        });
        return {
            id: response.id,
            applicationId: response.applicationId,
            sessionSequence: response.sessionSequence,
            status: response.status,
            scheduledAt: parseTimestamp(response.scheduledAt),
            startedAt: parseTimestamp(response.startedAt),
            completedAt: parseTimestamp(response.completedAt),
        };
    },

    /** Maps to proto: GetCommitteeSession */
    getSession: async (id: string): Promise<CommitteeSession | null> => {
        if (USE_DUMMY_DATA) {
            return DUMMY_SESSIONS.find(s => s.id === id) || null;
        }
        const response = await committeeClient.getCommitteeSession({ id });
        return {
            id: response.id,
            applicationId: response.applicationId,
            sessionSequence: response.sessionSequence,
            status: response.status,
            scheduledAt: parseTimestamp(response.scheduledAt),
            startedAt: parseTimestamp(response.startedAt),
            completedAt: parseTimestamp(response.completedAt),
        };
    },

    /** Maps to proto: ListCommitteeSessionsByApplication */
    listSessions: async (applicationId: string): Promise<CommitteeSession[]> => {
        if (USE_DUMMY_DATA) {
            return DUMMY_SESSIONS.filter(s => s.applicationId === applicationId);
        }
        const response = await committeeClient.listCommitteeSessionsByApplication({ applicationId });
        return (response.sessions || []).map((s: any) => ({
            id: s.id,
            applicationId: s.applicationId,
            sessionSequence: s.sessionSequence,
            status: s.status,
            scheduledAt: parseTimestamp(s.scheduledAt),
            startedAt: parseTimestamp(s.startedAt),
            completedAt: parseTimestamp(s.completedAt),
        }));
    },

    /** Maps to proto: SubmitCommitteeVote */
    submitVote: async (committeeSessionId: string, data: {
        userId: string;
        vote: string;
        voteReason: string;
    }): Promise<CommitteeVote> => {
        if (USE_DUMMY_DATA) {
            const newVote: CommitteeVote = {
                id: `vote-${Date.now()}`,
                committeeSessionId,
                userId: data.userId,
                vote: data.vote,
                voteReason: data.voteReason,
                votedAt: new Date().toISOString(),
            };
            if (!DUMMY_VOTES[committeeSessionId]) DUMMY_VOTES[committeeSessionId] = [];
            DUMMY_VOTES[committeeSessionId].push(newVote);
            return newVote;
        }
        const response = await committeeClient.submitCommitteeVote({
            committeeSessionId,
            userId: data.userId,
            vote: data.vote,
            voteReason: data.voteReason,
        });
        return {
            id: response.id,
            committeeSessionId: response.committeeSessionId,
            userId: response.userId,
            vote: response.vote,
            voteReason: response.voteReason,
            votedAt: parseTimestamp(response.votedAt),
        };
    },

    /** Maps to proto: FinalizeCommitteeDecision */
    finalizeDecision: async (committeeSessionId: string, data: {
        decision: string;
        decisionReason: string;
        approvedAmount: string;
        approvedTenor: number;
        approvedInterestRate: string;
        requiresNextCommittee: boolean;
    }): Promise<CommitteeDecision> => {
        if (USE_DUMMY_DATA) {
            const newDecision: CommitteeDecision = {
                id: `cdec-${Date.now()}`,
                committeeSessionId,
                ...data,
                decidedAt: new Date().toISOString(),
            };
            DUMMY_COMMITTEE_DECISIONS[committeeSessionId] = newDecision;
            const session = DUMMY_SESSIONS.find(s => s.id === committeeSessionId);
            if (session) session.status = "COMPLETED";
            return newDecision;
        }
        const response = await committeeClient.finalizeCommitteeDecision({
            committeeSessionId,
            decision: data.decision,
            decisionReason: data.decisionReason,
            approvedAmount: data.approvedAmount,
            approvedTenor: data.approvedTenor,
            approvedInterestRate: data.approvedInterestRate,
            requiresNextCommittee: data.requiresNextCommittee,
        });
        return {
            id: response.id,
            committeeSessionId: response.committeeSessionId,
            decision: response.decision,
            decisionReason: response.decisionReason,
            approvedAmount: response.approvedAmount,
            approvedTenor: response.approvedTenor,
            approvedInterestRate: response.approvedInterestRate,
            requiresNextCommittee: response.requiresNextCommittee,
            decidedAt: parseTimestamp(response.decidedAt),
        };
    },

    // ---- Decision Service methods ----

    /** Maps to proto: RecordFinalDecision */
    recordFinalDecision: async (applicationId: string, data: {
        decision: string;
        decisionSource: string;
        finalAmount: string;
        finalTenor: number;
        finalInterestRate: string;
        decisionReason: string;
        decidedBy: string;
    }): Promise<ApplicationDecision> => {
        if (USE_DUMMY_DATA) {
            const newDecision: ApplicationDecision = {
                id: `adec-${Date.now()}`,
                applicationId,
                ...data,
                decidedAt: new Date().toISOString(),
            };
            DUMMY_APP_DECISIONS[applicationId] = newDecision;
            return newDecision;
        }
        const response = await decisionClient.recordFinalDecision({
            applicationId,
            decision: data.decision,
            decisionSource: data.decisionSource,
            finalAmount: data.finalAmount,
            finalTenor: data.finalTenor,
            finalInterestRate: data.finalInterestRate,
            decisionReason: data.decisionReason,
            decidedBy: data.decidedBy,
        });
        return {
            id: response.id,
            applicationId: response.applicationId,
            decision: response.decision,
            decisionSource: response.decisionSource,
            finalAmount: response.finalAmount,
            finalTenor: response.finalTenor,
            finalInterestRate: response.finalInterestRate,
            decisionReason: response.decisionReason,
            decidedBy: response.decidedBy,
            decidedAt: parseTimestamp(response.decidedAt),
        };
    },

    /** Maps to proto: GetApplicationDecision */
    getDecision: async (applicationId: string): Promise<ApplicationDecision | null> => {
        if (USE_DUMMY_DATA) {
            return DUMMY_APP_DECISIONS[applicationId] || null;
        }
        const response = await decisionClient.getApplicationDecision({ applicationId });
        return {
            id: response.id,
            applicationId: response.applicationId,
            decision: response.decision,
            decisionSource: response.decisionSource,
            finalAmount: response.finalAmount,
            finalTenor: response.finalTenor,
            finalInterestRate: response.finalInterestRate,
            decisionReason: response.decisionReason,
            decidedBy: response.decidedBy,
            decidedAt: parseTimestamp(response.decidedAt),
        };
    },

    /** Maps to proto: AddDecisionCondition */
    addCondition: async (applicationId: string, conditionText: string): Promise<DecisionCondition> => {
        if (USE_DUMMY_DATA) {
            const newCondition: DecisionCondition = {
                id: `cond-${Date.now()}`,
                applicationId,
                conditionText,
                isMet: false,
                createdAt: new Date().toISOString(),
            };
            if (!DUMMY_CONDITIONS[applicationId]) DUMMY_CONDITIONS[applicationId] = [];
            DUMMY_CONDITIONS[applicationId].push(newCondition);
            return newCondition;
        }
        const response = await decisionClient.addDecisionCondition({ applicationId, conditionText });
        return {
            id: response.id,
            applicationId: response.applicationId,
            conditionText: response.conditionText,
            isMet: response.isMet,
            createdAt: parseTimestamp(response.createdAt),
        };
    },

    /** Maps to proto: ListDecisionConditions */
    listConditions: async (applicationId: string): Promise<DecisionCondition[]> => {
        if (USE_DUMMY_DATA) {
            return DUMMY_CONDITIONS[applicationId] || [];
        }
        const response = await decisionClient.listDecisionConditions({ applicationId });
        return (response.conditions || []).map((c: any) => ({
            id: c.id,
            applicationId: c.applicationId,
            conditionText: c.conditionText,
            isMet: c.isMet,
            createdAt: parseTimestamp(c.createdAt),
        }));
    },
};
