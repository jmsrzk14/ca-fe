// ============================================================
// Shared API Types — aligned with proto definitions
// ============================================================

// ---- Applicant Service ----

export type ApplicantType = 'PERSONAL' | 'COMPANY';

/** Maps to proto: ApplicantAttribute */
export interface ApplicantAttribute {
    attributeId: string;
    value: string;
    dataType: string;
    updatedAt?: string | null;
    choiceId?: string;
    /** @deprecated Use attributeId. Kept for backward compatibility with older components */
    key?: string;
}

/** Maps to proto: Applicant */
export interface Applicant {
    id: string;
    applicantType: ApplicantType;
    identityNumber: string;
    taxId: string;
    fullName: string;
    birthDate: string;
    establishmentDate: string;
    attributes: ApplicantAttribute[];
    createdAt?: string | null;
}

/** Maps to proto: ApplicantPartyResponse */
export interface ApplicantParty {
    partyId: string;
    partyType: string;
    name: string;
    identifier: string;
    dateOfBirth: string;
    roleCode: string;
    ownershipPct: number;
    position: string;
    slikRequired: boolean;
}

// ---- Application Service ----

/** Maps to proto: ApplicationAttribute */
export interface ApplicationAttribute {
    attributeId: string;
    value: string;
    dataType: string;
    choiceId?: string;
}

export type ApplicationStatus =
    | 'INTAKE'
    | 'ANALYSIS'
    | 'SURVEY'
    | 'COMMITTEE'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED';

/** Maps to proto: Application */
export interface Application {
    id: string;
    applicantId: string;
    applicantName: string;
    productId: string;
    aoId: string;
    loanAmount: string;       // string per proto
    tenorMonths: number;
    interestType: string;
    interestRate: string;     // string per proto
    loanPurpose: string;
    applicationChannel: string;
    status: ApplicationStatus;
    branchCode: string;
    attributes: ApplicationAttribute[];
    submittedAt: string | null;
    createdAt: string;
}

/** Maps to proto: ApplicationParty */
export interface ApplicationParty {
    applicationId: string;
    partyId: string;
    partyType: string;
    name: string;
    identifier: string;
    roleCode: string;
    legalObligation: boolean;
    slikRequired: boolean;
}

// ---- Reference Service ----

/** Maps to proto: AttributeCategory */
export interface AttributeCategory {
    categoryCode: string;
    categoryName: string;
    uiIcon: string;
    displayOrder: number;
    description: string;
}

/** Maps to proto: AttributeChoice */
export interface AttributeChoice {
    id: string;
    attributeId: string;
    code: string;
    value: string;
    displayOrder: number;
    isActive: boolean;
}

/** Maps to proto: AttributeRegistry */
export interface AttributeRegistry {
    id: string;
    attributeCode: string;
    appliesTo: string;
    scope: string;
    dataType: string;
    categoryCode: string;
    uiLabel: string;
    isRequired: boolean;
    riskRelevant: boolean;
    isActive: boolean;
    hideOnCreate: boolean;
    displayOrder: number;
    description: string;
    categoryName?: string;
    categoryIcon?: string;
    choices?: AttributeChoice[];
}

/** Maps to proto: LoanProduct */
export interface LoanProduct {
    id: string;
    productCode: string;
    productName: string;
    segment: string;
    active: boolean;
}

/** Maps to proto: Branch */
export interface Branch {
    branchCode: string;
    branchName: string;
    regionCode: string;
}

/** Maps to proto: LoanOfficer */
export interface LoanOfficer {
    id: string;
    officerCode: string;
    branchCode: string;
}

/** Maps to proto: ApplicationStatusRef */
export interface ApplicationStatusRef {
    statusCode: string;
    statusGroup: string;
    isTerminal: boolean;
    description: string;
}

/** Maps to proto: FinancialGLAccount */
export interface FinancialGLAccount {
    glCode: string;
    glName: string;
    statementType: string;
    category: string;
    sign: number;
    isDebtService: boolean;
    isOperating: boolean;
    description: string;
}

/** Maps to proto: Choice */
export interface Choice {
    code: string;
    value: string;
}

/** Maps to proto: SurveyTemplate (reference service) */
export interface SurveyTemplateRef {
    id: string;
    templateCode: string;
    templateName: string;
    applicantType: string;
    productId: string;
}

// ---- Financial Service ----

/** Maps to proto: ApplicationFinancialFact */
export interface FinancialFact {
    id: string;
    applicationId: string;
    glCode: string;
    periodType: string;
    periodLabel: string;
    amount: string;       // string per proto
    source: string;
    confidenceLevel: string;
    createdAt?: string;
}

/** Maps to proto: ApplicationAsset */
export interface Asset {
    id: string;
    applicationId: string;
    assetTypeCode: string;
    assetName: string;
    ownershipStatus: string;
    acquisitionYear: number;
    estimatedValue: string;   // string per proto
    valuationMethod: string;
    locationText: string;
    encumbered: boolean;
}

/** Maps to proto: ApplicationLiability */
export interface Liability {
    id: string;
    applicationId: string;
    creditorName: string;
    liabilityType: string;
    outstandingAmount: string;  // string per proto
    monthlyInstallment: string; // string per proto
    interestRate: string;
    maturityDate: string;
    source: string;
}

/** Maps to proto: FinancialRatio */
export interface FinancialRatio {
    id: string;
    applicationId: string;
    ratioCode: string;
    ratioValue: string;          // string per proto
    calculationVersion: string;
    calculatedAt?: string;
}

// ---- Decision Service ----

/** Maps to proto: CommitteeSession */
export interface CommitteeSession {
    id: string;
    applicationId: string;
    sessionSequence: number;
    status: string;
    scheduledAt?: string;
    startedAt?: string;
    completedAt?: string;
}

/** Maps to proto: CommitteeVote */
export interface CommitteeVote {
    id: string;
    committeeSessionId: string;
    userId: string;
    vote: string;
    voteReason: string;
    votedAt?: string;
}

/** Maps to proto: CommitteeDecision */
export interface CommitteeDecision {
    id: string;
    committeeSessionId: string;
    decision: string;
    decisionReason: string;
    approvedAmount: string;   // string per proto
    approvedTenor: number;
    approvedInterestRate: string;
    requiresNextCommittee: boolean;
    decidedAt?: string;
}

/** Maps to proto: ApplicationDecision */
export interface ApplicationDecision {
    id: string;
    applicationId: string;
    decision: string;
    decisionSource: string;
    finalAmount: string;      // string per proto
    finalTenor: number;
    finalInterestRate: string;
    decisionReason: string;
    decidedBy: string;
    decidedAt?: string;
}

/** Maps to proto: DecisionCondition */
export interface DecisionCondition {
    id: string;
    applicationId: string;
    conditionText: string;
    isMet: boolean;
    createdAt?: string;
}

// ---- Survey Service ----

/** Maps to proto: SurveyTemplate */
export interface SurveyTemplate {
    id: string;
    templateCode: string;
    templateName: string;
    applicantType: string;
    productId: string;
    active: boolean;
    sections?: SurveySection[];
}

/** Maps to proto: SurveySection */
export interface SurveySection {
    id: string;
    templateId: string;
    sectionName: string;
    sequence: number;
    questions?: SurveyQuestion[];
}

/** Maps to proto: SurveyQuestion */
export interface SurveyQuestion {
    id: string;
    sectionId: string;
    questionText: string;
    answerType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'OPTION' | 'IMAGE';
    sequence: number;
    isRequired: boolean;
    options?: SurveyQuestionOption[];
}

/** Maps to proto: SurveyQuestionOption */
export interface SurveyQuestionOption {
    id: string;
    questionId: string;
    optionText: string;
    optionValue: string;
}

export type SurveyStatus = 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED';

/** Maps to proto: ApplicationSurvey */
export interface Survey {
    id: string;
    applicationId: string;
    templateId: string;
    surveyType: string;
    status: SurveyStatus;
    assignedTo: string;
    surveyPurpose: string;
    startedAt?: string;
    submittedAt?: string;
    submittedBy?: string;
    applicantName?: string;
    applicationStatus?: string;
    totalQuestions?: number;
    answeredQuestions?: number;
    answers?: SurveyAnswer[];
}

/** Maps to proto: SurveyAnswer */
export interface SurveyAnswer {
    id?: string;
    surveyId: string;
    questionId: string;
    answerText?: string;
    answerNumber?: string;
    answerBoolean?: boolean;
    answerDate?: string;
    answeredAt?: string;
}

/** Maps to proto: SurveyEvidence */
export interface SurveyEvidence {
    id?: string;
    surveyId: string;
    evidenceType: string;
    fileUrl: string;
    description: string;
    capturedAt?: string;
}

// ---- Media Service ----

/** Maps to proto: Document */
export interface Document {
    id: string;
    applicationId: string;
    documentName: string;
    fileUrl: string;
    documentType: string;
    uploadedAt?: string;
}

// ---- Generic ----

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ApplicationListResponse {
    applications: Application[];
    nextCursor: string;
    hasNext: boolean;
}
