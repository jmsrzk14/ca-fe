import { LoanAnalytics, LoanApplication, Task, ApplicationStatusData } from '../types';

export const dashboardService = {
    getAnalytics: async (): Promise<LoanAnalytics> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
            totalActiveLoans: 423,
            loansChange: 12.5,
            activeApplications: 86,
            appsChange: 5.2,
            totalFunded: 2450000,
            fundedChange: 18.7,
            pendingTasks: 42,
            tasksChange: -10.2,
        };
    },

    getApplicationStatusData: async (): Promise<ApplicationStatusData[]> => {
        return [
            { name: 'Sent', value: 400 },
            { name: 'In Review', value: 300 },
            { name: 'Approved', value: 300 },
            { name: 'Declined', value: 200 },
        ];
    },

    getRecentApplications: async (): Promise<LoanApplication[]> => {
        return [
            {
                id: 'L-1001',
                borrower: { name: 'Olivia Martin', email: 'olivia@email.com', avatar: 'https://github.com/shadcn.png' },
                amount: 25000,
                product: 'Personal Loan',
                status: 'In Review',
                createdAt: '2024-02-14',
            },
            {
                id: 'L-1002',
                borrower: { name: 'Jackson Lee', email: 'jackson@email.com', avatar: 'https://github.com/shadcn.png' },
                amount: 150000,
                product: 'Mortgage',
                status: 'Approved',
                createdAt: '2024-02-13',
            },
            {
                id: 'L-1003',
                borrower: { name: 'Isabella Nguyen', email: 'isabella@email.com', avatar: 'https://github.com/shadcn.png' },
                amount: 12000,
                product: 'Auto Loan',
                status: 'Draft',
                createdAt: '2024-02-14',
            },
            {
                id: 'L-1004',
                borrower: { name: 'William Kim', email: 'will@email.com', avatar: 'https://github.com/shadcn.png' },
                amount: 45000,
                product: 'Business Loan',
                status: 'Funded',
                createdAt: '2024-02-12',
            },
        ];
    },

    getPendingTasks: async (): Promise<Task[]> => {
        return [
            { id: 'T-1', title: 'Review document for L-1001', status: 'Pending', dueDate: 'Today', priority: 'High' },
            { id: 'T-2', title: 'Call borrower Jackson Lee', status: 'Pending', dueDate: 'Tomorrow', priority: 'Medium' },
            { id: 'T-3', title: 'Final approval for L-1004', status: 'Completed', dueDate: 'Yesterday', priority: 'High' },
            { id: 'T-4', title: 'Schedule fund transfer', status: 'Pending', dueDate: 'Feb 16', priority: 'Low' },
        ];
    },
};
