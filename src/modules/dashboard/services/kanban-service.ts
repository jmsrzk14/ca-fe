import { ApplicationListResponse, Application } from '@/shared/types/api';
import { applicationService } from '@/core/api/services/application-service';
import {
    ApplicationCardData,
    APPLICATION_STATUS_COLUMNS,
    KanbanColumnData,
    ApplicationStatus,
} from '../types/kanban';

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    } catch {
        return iso;
    }
}

function mapToCardData(app: any): ApplicationCardData {
    return {
        id: app.id || "unknown",
        identityNumber: app.identityNumber || "unknown",
        fullName: app.fullName || "",
        productId: app.productId || "",
        aoId: app.aoId || "",
        refNumber: (app.id || "").slice(0, 8).toUpperCase() || "NEW",
        date: formatDate(app.createdAt),
        amount: parseFloat(app.loanAmount || "0") || 0,
        tenorMonths: app.tenorMonths || 0,
        branchCode: app.branchCode || "",
        status: app.status || "INTAKE",
        loanPurpose: app.loanPurpose || "",
    };
}

export const kanbanService = {
    getBoardData: async (): Promise<KanbanColumnData[]> => {
        const response = await applicationService.list();

        // Build a map of status -> cards
        const cardsByStatus: Record<string, ApplicationCardData[]> = {};
        const applications = response.applications || [];
        for (const app of applications) {
            const status = app.status || "INTAKE";
            if (!cardsByStatus[status]) {
                cardsByStatus[status] = [];
            }
            cardsByStatus[status].push(mapToCardData(app));
        }

        // Build columns in fixed order, filling in empty ones
        return APPLICATION_STATUS_COLUMNS.map(col => {
            const apps = cardsByStatus[col.id] ?? [];
            const totalAmount = apps.reduce((sum, a) => sum + a.amount, 0);
            return {
                id: col.id,
                title: col.title,
                color: col.color,
                count: apps.length,
                totalAmount,
                applications: apps,
            };
        });
    },
};
