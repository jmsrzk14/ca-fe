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
    // If no interpolation, just pass through as a simple message
    if (values.length === 0) {
        try {
            return i18n._(strings[0]);
        } catch {
            // i18n not yet activated — return the raw string
            return strings[0];
        }
    }

    // Build the interpolated string directly as fallback
    let raw = strings[0];
    for (let i = 0; i < values.length; i++) {
        raw += String(values[i]) + strings[i + 1];
    }

    // Try Lingui translation, fall back to raw interpolation
    try {
        // Build the message pattern: "Hello {0}, welcome to {1}"
        let message = strings[0];
        for (let i = 0; i < values.length; i++) {
            message += `{${i}}` + strings[i + 1];
        }

        const valuesObj: Record<string, unknown> = {};
        for (let i = 0; i < values.length; i++) {
            valuesObj[String(i)] = values[i];
        }

        return i18n._(message, valuesObj);
    } catch {
        return raw;
    }
}
