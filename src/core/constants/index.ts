export const APP_CONFIG = {
  NAME: 'Credit Analytics',
  DESCRIPTION: 'Credit Analytics Dots',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dots-ca-be-production.up.railway.app',
} as const;

export const ROUTES = {
  DASHBOARD: '/',
  APPLICATIONS: '/applications',
  BORROWERS: '/borrowers',
  CREDIT_BUREAU: '/credit-bureau',
  SETTINGS: '/settings',
  ATTRIBUTES: '/settings/attributes',
  CATEGORIES: '/settings/categories',
} as const;

export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  STORAGE_KEY: 'horizon-theme',
} as const;
