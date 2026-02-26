import { ApplicationListResponse, Application } from '@/shared/types/api';
import { applicationService } from '@/core/api/services/application-service';
import { applicantService } from '@/core/api/services/applicant-service';
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
        applicantId: app.applicantId || "unknown",
        applicantType: app.applicantType || "PERSONAL",
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
        const applications = response.applications || [];

        // Fetch applicant details for each unique applicantId
        const uniqueApplicantIds = Array.from(new Set(applications.map((app: any) => app.applicantId).filter(Boolean)));

        const applicantsData = await Promise.all(
            uniqueApplicantIds.map(async (id: any) => {
                try {
                    const applicant = await applicantService.getById(id);
                    return { id, applicant };
                } catch (e) {
                    console.error(`Failed to fetch applicant ${id}`, e);
                    return { id, applicant: null };
                }
            })
        );

        const applicantMap = applicantsData.reduce((acc, curr) => {
            if (curr.applicant) {
                acc[curr.id] = curr.applicant;
            }
            return acc;
        }, {} as Record<string, any>);

        // Build a map of status -> cards
        const cardsByStatus: Record<string, ApplicationCardData[]> = {};
        for (const app of applications) {
            const status = app.status || "INTAKE";
            if (!cardsByStatus[status]) {
                cardsByStatus[status] = [];
            }

            const applicant = applicantMap[app.applicantId];
            const enrichedApp = {
                ...app,
                applicantId: app.applicantId,
                applicantType: applicant?.applicantType || "PERSONAL",
                fullName: applicant?.fullName || "Unknown Applicant",
                identityNumber: applicant?.identityNumber || "unknown",
            };

            cardsByStatus[status].push(mapToCardData(enrichedApp));
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
