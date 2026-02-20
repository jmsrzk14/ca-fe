import { i18n } from "@lingui/core";

export const locales = {
    en: "EN",
    id: "ID",
};
export const defaultLocale = "en";

export function getInitialLocale(): string {
    if (typeof window !== "undefined") {
        return localStorage.getItem("lang") || defaultLocale;
    }
    return defaultLocale;
}

export async function dynamicActivate(locale: string) {
    const { messages } = await import(`@/locales/${locale}/messages.po`);
    i18n.load(locale, messages);
    i18n.activate(locale);
    if (typeof window !== "undefined") {
        localStorage.setItem("lang", locale);
    }
}
