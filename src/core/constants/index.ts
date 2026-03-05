export const APP_CONFIG = {
  NAME: 'Credit Analytics',
  DESCRIPTION: 'Credit Analytics Dots',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://creditanalyticsbackend-production.up.railway.app',
} as const;

export const ROUTES = {
  DASHBOARD: '/',
  APPLICATIONS: '/applications',
  BORROWERS: '/borrowers',
  SETTINGS: '/settings',
  ATTRIBUTES: '/settings/attributes',
} as const;

export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  STORAGE_KEY: 'horizon-theme',
} as const;
