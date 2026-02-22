export interface LoanAnalytics {
    totalActiveLoans: number;
    loansChange: number;
    activeApplications: number;
    appsChange: number;
    totalFunded: number;
    fundedChange: number;
    pendingTasks: number;
    tasksChange: number;
}

export interface ApplicationSummary {
    id: string;
    applicantId: string;
    applicant?: {
        name: string;
        email: string;
        avatar: string;
    };
    amount: number;
    product: string;
    status: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    status: 'Pending' | 'Completed' | 'Overdue';
    dueDate: string;
    priority: 'Low' | 'Medium' | 'High';
}

export interface ActivityData {
    day: string;
    value: number; // For heatmap
}

export interface ApplicationStatusData {
    name: string;
    value: number;
}
