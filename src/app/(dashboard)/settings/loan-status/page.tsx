import { LoanStatusView } from "@/modules/settings/loan-status-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Status Peminjaman",
};

export default function LoanStatusPage() {
    return <LoanStatusView />;
}
