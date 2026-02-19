import { CRRAssessmentView } from "@/modules/settings/crr-assessment-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Penilaian CRR",
};

export default function CRRAssessmentPage() {
    return <CRRAssessmentView />;
}
