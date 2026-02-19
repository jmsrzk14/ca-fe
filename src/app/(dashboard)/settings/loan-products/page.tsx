import { LoanProductsView } from "@/modules/settings/loan-products-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Produk Peminjaman",
};

export default function LoanProductsPage() {
    return <LoanProductsView />;
}
