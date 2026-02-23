import { i18n } from "@lingui/core";

/**
 * A runtime replacement for @lingui/macro's `t` tagged template literal.
 * Works without SWC/Babel compiler transforms.
 *
 * Safe to call before i18n.activate() — falls back to raw string interpolation.
 *
 * Usage: t`Hello ${name}` → "Hello John"
 */
export function t(
    strings: TemplateStringsArray,
    ...values: unknown[]
): string {
    const rawKey = values.length === 0
        ? strings[0]
        : strings.reduce((acc, str, i) => acc + (i > 0 ? `{${i - 1}}` : "") + str, "");

    // Build interpolated string for immediate fallback
    const fallback = strings.reduce((acc, str, i) => acc + (i > 0 ? String(values[i - 1]) : "") + str, "");

    try {
        // Only try Lingui if it has the message to avoid "Uncompiled message" warning
        if (i18n.messages && i18n.messages[i18n.locale] && i18n.messages[i18n.locale][rawKey]) {
            if (values.length === 0) return i18n._(rawKey);

            const valuesObj: Record<string, unknown> = {};
            for (let i = 0; i < values.length; i++) {
                valuesObj[String(i)] = values[i];
            }
            return i18n._(rawKey, valuesObj);
        }
        return fallback;
    } catch {
        return fallback;
    }
}
