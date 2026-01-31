// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  COMPANIES: '/companies',
  COMPANIES_SEARCH: '/companies/search',
  DRIVERS: '/drivers',
  DRIVERS_SEARCH: '/drivers/search',
  VEHICLES: '/vehicles',
  TRIPS: '/trips'
} as const;

// Route Paths
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  COMPANIES: '/companies',
  DRIVERS: '/drivers',
  VEHICLES: '/vehicles',
  TRIPS: '/trips',
  FAQ: '/sss'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  LANGUAGE: 'lang'
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD.MM.YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD.MM.YYYY HH:mm'
} as const;

// Type exports
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Yardımcı fonksiyonlar
export const isApiEndpoint = (value: string): boolean => {
  return Object.values(API_ENDPOINTS).includes(value as ApiEndpoint);
};

export const isRoute = (value: string): value is Route => {
  return Object.values(ROUTES).includes(value as Route);
};

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
  DEBUG: import.meta.env.ENABLE_DEBUG
} as const;
