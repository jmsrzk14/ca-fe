export const APP_CONFIG = {
  NAME: 'Horizon Admin',
  DESCRIPTION: 'Premium Clean Architecture Dashboard',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
} as const;

export const ROUTES = {
  DASHBOARD: '/',
  APPLICATIONS: '/applications',
  ANALYTICS: '/analytics',
  CUSTOMERS: '/customers',
  ORDERS: '/orders',
  SETTINGS: '/settings',
} as const;

export const THEME_CONFIG = {
  DEFAULT_THEME: 'dark',
  STORAGE_KEY: 'horizon-theme',
} as const;
