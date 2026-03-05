import { AttributeManagementView } from '@/modules/applicant/components/attribute-management-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Registry Field',
};

export default function AttributeManagementPage() {
    return (
        <AttributeManagementView />
    );
}
