import { redirect } from "next/navigation";
import { ROUTES } from "@/core/constants";

export default function SettingsPage() {
    redirect(ROUTES.SETTINGS_LOAN_PRODUCTS);
}
