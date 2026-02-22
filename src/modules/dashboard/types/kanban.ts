import type { ApplicationStatus } from '@/shared/types/api';

export type { ApplicationStatus };

export const APPLICATION_STATUS_COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
    { id: 'INTAKE', title: 'Intake', color: 'border-t-slate-400' },
    { id: 'ANALYSIS', title: 'Analysis', color: 'border-t-blue-400' },
    { id: 'SURVEY', title: 'Survey', color: 'border-t-purple-400' },
    { id: 'COMMITTEE', title: 'Committee', color: 'border-t-orange-400' },
    { id: 'APPROVED', title: 'Approved', color: 'border-t-emerald-400' },
    { id: 'REJECTED', title: 'Rejected', color: 'border-t-rose-400' },
    { id: 'DISBURSED', title: 'Disbursed', color: 'border-t-teal-400' },
];

export interface ApplicationCardData {
    id: string;
    applicantId: string;
    productId: string;
    aoId: string;
    // Display-friendly fields (derived from API)
    refNumber: string;          // short form of ID
    date: string;               // formatted createdAt
    amount: number;             // parsed from loanAmount string
    tenorMonths: number;
    branchCode: string;
    status: ApplicationStatus;
    loanPurpose: string;
}

export interface KanbanColumnData {
    id: ApplicationStatus;
    title: string;
    color: string;
    count: number;
    totalAmount: number;
    applications: ApplicationCardData[];
}
