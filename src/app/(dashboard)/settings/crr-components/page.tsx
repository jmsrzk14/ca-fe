import { CRRComponentsView } from "@/modules/settings/crr-components-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Komponen CRR",
};

export default function CRRComponentsPage() {
    return <CRRComponentsView />;
}
