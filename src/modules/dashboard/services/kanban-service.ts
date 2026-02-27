import { ApplicationListResponse, Application } from '@/shared/types/api';
import { applicationService } from '@/core/api/services/application-service';
import { applicantService } from '@/core/api/services/applicant-service';
import { referenceService } from '@/core/api/services/reference-service';
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
        const [appResponse, statusResponse] = await Promise.all([
            applicationService.list(),
            referenceService.listApplicationStatuses()
        ]);

        const applications = appResponse.applications || [];
        const statuses = statusResponse.statuses || [];

        // Map status colors for fallback
        const colorMap: Record<string, string> = {
            'INTAKE': 'border-t-slate-400',
            'ANALYSIS': 'border-t-blue-400',
            'SURVEY': 'border-t-purple-400',
            'COMMITTEE': 'border-t-orange-400',
            'APPROVED': 'border-t-emerald-400',
            'REJECTED': 'border-t-rose-400',
            'DISBURSED': 'border-t-teal-400',
            'CANCELLED': 'border-t-slate-300',
        };

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
            const status = app.status || "UNKNOWN";
            if (!cardsByStatus[status]) {
                cardsByStatus[status] = [];
            }

            const applicant = applicantMap[app.applicantId];
            const enrichedApp = {
                ...app,
                applicantId: app.applicantId,
                applicantType: applicant?.applicantType || "PERSONAL",
                fullName: app.applicantName || applicant?.fullName || "Unknown Applicant",
                identityNumber: applicant?.identityNumber || "unknown",
            };

            cardsByStatus[status].push(mapToCardData(enrichedApp));
        }

        // Build columns based on proto statuses
        return statuses.map(s => {
            const statusCode = s.statusCode as ApplicationStatus;
            const apps = cardsByStatus[statusCode] ?? [];
            const totalAmount = apps.reduce((sum, a) => sum + a.amount, 0);
            return {
                id: statusCode,
                title: s.statusCode || statusCode,
                color: colorMap[statusCode] || 'border-t-slate-400',
                count: apps.length,
                totalAmount,
                applications: apps,
            };
        });
    },
};
