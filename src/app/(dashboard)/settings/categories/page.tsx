import { CategoryManagementView } from '@/modules/applicant/components/category-management-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Registry Category',
};

export default function CategoryManagementPage() {
    return (
        <CategoryManagementView />
    );
}
