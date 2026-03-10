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
