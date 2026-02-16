import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard-service';

export const useLoanAnalytics = () => {
    return useQuery({
        queryKey: ['dashboard', 'loan-analytics'],
        queryFn: dashboardService.getAnalytics,
    });
};

export const useApplicationStatus = () => {
    return useQuery({
        queryKey: ['dashboard', 'application-status'],
        queryFn: dashboardService.getApplicationStatusData,
    });
};

export const useRecentApplications = () => {
    return useQuery({
        queryKey: ['dashboard', 'recent-applications'],
        queryFn: dashboardService.getRecentApplications,
    });
};

export const usePendingTasks = () => {
    return useQuery({
        queryKey: ['dashboard', 'pending-tasks'],
        queryFn: dashboardService.getPendingTasks,
    });
};
