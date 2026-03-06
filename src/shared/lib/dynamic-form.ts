import { z } from 'zod';
import { AttributeRegistry } from '@/shared/types/api';

/**
 * Builds a Zod schema from an array of AttributeRegistry items.
 * Each attribute becomes a keyed field in the schema object.
 */
export function buildDynamicSchema(attributes: AttributeRegistry[]): z.ZodObject<any> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const attr of attributes) {
        const key = attr.attributeCode;
        let field: z.ZodTypeAny;

        switch (attr.dataType?.toUpperCase()) {
            case 'NUMBER':
                field = attr.isRequired
                    ? z.string().min(1, `${attr.uiLabel || key} wajib diisi`)
                    : z.string();
                break;
            case 'BOOLEAN':
                field = attr.isRequired
                    ? z.string().min(1, `${attr.uiLabel || key} wajib diisi`)
                    : z.string();
                break;
            case 'DATE':
                field = attr.isRequired
                    ? z.string().min(1, `${attr.uiLabel || key} wajib diisi`)
                    : z.string();
                break;
            case 'SELECT':
                field = attr.isRequired
                    ? z.string().min(1, `${attr.uiLabel || key} wajib diisi`)
                    : z.string();
                break;
            default: // STRING / TEXT
                field = attr.isRequired
                    ? z.string().min(1, `${attr.uiLabel || key} wajib diisi`)
                    : z.string();
                break;
        }

        shape[key] = field;
    }

    return z.object(shape);
}

/**
 * Resolves a choiceId for a given attribute value.
 */
export function resolveChoiceId(attr: AttributeRegistry, value: string): string | undefined {
    if (!value) return undefined;
    const dt = attr.dataType?.toUpperCase();
    if (dt === 'SELECT' || dt === 'BOOLEAN') {
        const choice = attr.choices?.find(opt => opt.code === String(value));
        return choice?.id;
    }
    return undefined;
}
