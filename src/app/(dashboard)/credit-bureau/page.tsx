import { Metadata } from 'next';
import { SlikUploadView } from '@/modules/credit-bureau/components/slik-upload-view';

export const metadata: Metadata = {
    title: 'Credit Bureau - SLIK OJK',
};

export default function CreditBureauPage() {
    return <SlikUploadView />;
}
