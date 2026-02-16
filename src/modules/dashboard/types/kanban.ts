export type ApplicationStatus =
    | 'Collect Additional Data'
    | 'Application in Progress'
    | 'Review Required'
    | 'Automated Decisioning'
    | 'Offers Available';

export interface ApplicationCardData {
    id: string;
    borrowerName: string;
    refNumber: string;
    date: string;
    amount: number;
    status: ApplicationStatus;
    assignees: {
        name: string;
        avatar: string;
    }[];
    tags?: string[];
}

export interface KanbanColumnData {
    id: ApplicationStatus;
    title: string;
    count: number;
    totalAmount: number;
    applications: ApplicationCardData[];
}
