// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  COMPANIES: '/companies',
  DRIVERS: '/drivers',
  VEHICLES: '/vehicles',
  TRIPS: '/trips',
  REPORTS: {
    TOP_COMPANIES: '/reports/top-companies',
    UNLOAD_WAITING: '/reports/unload-waiting',
    STATUS_DISTRIBUTION: '/reports/status-distribution',
    AVERAGE_TURNAROUND: '/reports/average-turnaround',
    TREND: '/reports/trend',
    DASHBOARD_SUMMARY: '/reports/dashboard-summary',
    PARKING_LOT: '/reports/parking-lot-dashboard',
    EXPORT_EXCEL: '/reports/export/excel',
    EXPORT_PDF: '/reports/export/pdf'
  },
  AUDIT: '/audit',
  USERS: '/users',
} as const;

// Route Paths
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  COMPANIES: '/companies',
  DRIVERS: '/drivers',
  VEHICLES: '/vehicles',
  TRIPS: '/trips',
  FAQ: '/sss',
  FIELD_OPS: '/field-operations',
  AUDIT: '/audit',
  USERS: '/users',
  PROFILE: '/profile'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
} as const;

// Environment-based constants
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  APP: {
    NAME: import.meta.env.VITE_APP_NAME,
    TITLE: import.meta.env.VITE_APP_TITLE,
    DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION,
    KEYWORDS: import.meta.env.VITE_APP_KEYWORDS,
    AUTHOR: import.meta.env.VITE_APP_AUTHOR,
    VERSION: import.meta.env.VITE_APP_VERSION,
    LOGO: '/logo.png',
    FAVICON: '/favicon.ico'
  },
  DEFAULT_LOCALE: import.meta.env.VITE_DEFAULT_LOCALE,
  DEFAULT_PAGE_SIZE: import.meta.env.VITE_DEFAULT_PAGE_SIZE,
  DEBUG: import.meta.env.VITE_ENABLE_DEBUG
} as const;
