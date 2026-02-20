export const APP_CONFIG = {
  NAME: 'Horizon Admin',
  DESCRIPTION: 'Premium Clean Architecture Dashboard',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://creditanalyticsbackend-production.up.railway.app',
} as const;

export const ROUTES = {
  DASHBOARD: '/',
  APPLICATIONS: '/applications',
  BORROWERS: '/borrowers',
  SLIK: '/slik',
  SETTINGS: '/settings',
  SETTINGS_LOAN_PRODUCTS: '/settings/loan-products',
  SETTINGS_CRR_COMPONENTS: '/settings/crr-components',
  SETTINGS_CRR_ASSESSMENT: '/settings/crr-assessment',
  SETTINGS_LOAN_STATUS: '/settings/loan-status',
} as const;

export const THEME_CONFIG = {
  DEFAULT_THEME: 'dark',
  STORAGE_KEY: 'horizon-theme',
} as const;
