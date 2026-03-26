import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThousands(value?: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  const str = typeof value === 'number' ? value.toString() : value.replace(/,/g, '');
  if (isNaN(Number(str))) return str;
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parseThousands(value: string): string {
  return value.replace(/,/g, '');
}

/**
 * Robustly parses a timestamp from the REST/gRPC response.
 */
export function parseTimestamp(ts: any): string | undefined {
  if (!ts) return undefined;
  if (typeof ts === 'string') return ts;
  if (ts.seconds !== undefined) {
    try {
      return new Date(Number(ts.seconds) * 1000).toISOString();
    } catch {
      return undefined;
    }
  }
  try {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  } catch {
    return undefined;
  }
}
