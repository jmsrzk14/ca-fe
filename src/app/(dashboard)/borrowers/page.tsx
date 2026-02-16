import { ApplicationKanban } from '@/modules/dashboard';

export default function ApplicationsPage() {
    return (
        <div className="h-[calc(100vh-theme(spacing.24))] px-6 py-2">
            <ApplicationKanban />
        </div>
    );
}
