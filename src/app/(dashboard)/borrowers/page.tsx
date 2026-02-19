// import { ApplicationKanban } from '@/modules/dashboard';

// export default function ApplicationsPage() {
//     return (
//         <div className="h-[calc(100vh-theme(spacing.24))] px-6 py-2">
//             <ApplicationKanban />
//         </div>
//     );
// }

import { ApplicantList } from '@/modules/applicant';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Peminjam',
};

export default function ApplicantsPage() {
    return (
        <div className="h-full px-6 py-6">
            <ApplicantList />
        </div>
    );
}

