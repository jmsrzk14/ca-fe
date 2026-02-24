export type ApplicantType = 'PERSONAL' | 'CORPORATE';
export type DataType = 'string' | 'number' | 'date' | 'boolean';

export interface Attribute {
    key: string;
    value: string;
    dataType: DataType;
    updatedAt?: string | null;
}

export interface Applicant {
    id: string;
    applicantType: ApplicantType;
    identityNumber: string;
    taxId: string;
    fullName: string;
    birthDate: string;
    establishmentDate: string;
    attributes: Attribute[];
    createdAt?: string | null;
}

export interface ApplicationAttribute {
    key: string;
    value: string;
    dataType: string;
}

export type ApplicationStatus =
    | 'INTAKE'
    | 'ANALYSIS'
    | 'SURVEY'
    | 'COMMITTEE'
    | 'APPROVED'
    | 'REJECTED'
    | 'DISBURSED';

export interface Application {
    id: string;
    applicantId: string;
    productId: string;
    aoId: string;
    loanAmount: string;       // comes as string from API
    tenorMonths: number;
    interestType: string;
    interestRate: string;     // comes as string from API
    loanPurpose: string;
    applicationChannel: string;
    status: ApplicationStatus;
    branchCode: string;
    attributes: ApplicationAttribute[];
    submittedAt: string | null;
    createdAt: string;
}

export interface StatusLog {
    id: string;
    applicationId: string;
    fromStatus: string;
    toStatus: string;
    reason: string;
    createdAt: string;
}

export interface FinancialFact {
    id: string;
    applicationId: string;
    key: string;
    value: number;
    category: string;
}

export interface Asset {
    id: string;
    applicationId: string;
    assetType: string;
    description: string;
    estimatedValue: number;
}

export interface Liability {
    id: string;
    applicationId: string;
    creditorName: string;
    outstandingAmount: number;
    monthlyInstallment: number;
}

export interface FinancialRatio {
    id: string;
    applicationId: string;
    ratioName: string;
    ratioValue: number;
}

export interface SurveyTemplate {
    id: string;
    name: string;
    description: string;
}

export interface Survey {
    id: string;
    applicationId: string;
    templateId: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    assignedTo: string;
    createdAt: string;
}

export interface SurveyAnswer {
    surveyId: string;
    questionId: string;
    answerValue: string;
}

export interface SurveyEvidence {
    surveyId: string;
    evidenceType: string;
    url: string;
    description: string;
}

export interface CommitteeSession {
    id: string;
    sessionDate: string;
    status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    applications: string[];
}

export interface CommitteeVote {
    committeeSessionId: string;
    voterId: string;
    applicationId: string;
    vote: 'APPROVE' | 'REJECT';
    comment: string;
}

export interface Decision {
    applicationId: string;
    finalStatus: 'APPROVED' | 'REJECTED';
    approvedAmount: number;
    approvedTenor: number;
    notes: string;
    decidedAt: string;
}

export interface LoanProduct {
    id: string;
    name: string;
    minAmount: number;
    maxAmount: number;
    interestRate: number;
}

export interface Branch {
    id: string;
    name: string;
    code: string;
}

export interface GLAccount {
    code: string;
    name: string;
    accountType: string;
}

export interface AttributeRegistry {
    attrKey: string;
    attrName: string;
    dataType: string;
    category: string;
    required: boolean;
    uiIcon?: string;
    uiLabel?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ApplicationListResponse {
    applications: Application[];
    nextCursor: string;
}
