import { LoanAnalytics, ApplicationSummary, Task, ApplicationStatusData } from '../types';
import { applicationService } from '@/core/api/services/application-service';
import { referenceService } from '@/core/api/services/reference-service';

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
        try {
            const response = await referenceService.listApplicationStatuses();
            return (response.statuses || []).map((s: any) => ({
                name: s.statusCode || s.description,
                value: 0 // Count should ideally come from another analytics endpoint or calculated
            }));
        } catch (error) {
            console.error('Failed to fetch application statuses:', error);
            return [];
        }
    },

    getRecentApplications: async (): Promise<ApplicationSummary[]> => {
        try {
            const response = await applicationService.list();
            return (response.applications || []).slice(0, 5).map((app: any) => ({
                id: app.id,
                applicantId: app.applicantId,
                applicant: {
                    name: app.applicantName || 'Unknown Applicant',
                    email: '-',
                    avatar: 'https://github.com/shadcn.png'
                },
                amount: Number(app.loanAmount) || 0,
                product: 'Loan',
                status: app.status || 'UNKNOWN',
                createdAt: app.createdAt || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Failed to fetch recent applications:', error);
            return [];
        }
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
