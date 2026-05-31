import { STORAGE_KEYS } from "../constants";
import type { UserRole, User } from "../types";
import { clearQueue } from "./offlineQueue";

// ---------------------------------------------------------------------------
// User (localStorage) — used as a cache/initialData for useAuth's useQuery
// ---------------------------------------------------------------------------

// ⚠️ SECURITY: Only non-sensitive fields are cached in localStorage.
// must come from the server (cookie-based session), never from localStorage for actual API calls.
// However, UI routing relies on localStorage cache to prevent flickering.
const SANITIZED_FIELDS = new Set(["_id", "email", "firstName", "lastName", "role"]);

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage not available
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage not available
    }
  },
};

export const getUser = (): User | null => {
  const userString = safeLocalStorage.getItem(STORAGE_KEYS.USER);
  if (!userString) return null;
  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

export const setUser = (user: Pick<User, "_id" | "email" | "firstName" | "lastName" | "role"> & Partial<User>): void => {
  const sanitized: Record<string, unknown> = {};
  for (const key of Object.keys(user)) {
    if (SANITIZED_FIELDS.has(key)) {
      sanitized[key] = (user as unknown as Record<string, unknown>)[key];
    }
  }
  safeLocalStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sanitized));
};

export const clearAuth = (): void => {
  safeLocalStorage.removeItem(STORAGE_KEYS.USER);
  clearQueue();
};

// ---------------------------------------------------------------------------
// Role helpers — always operate on the provided user object (no localStorage
// fallback for role, to prevent stale / tampered data being used for authz)
// ---------------------------------------------------------------------------

export const getRoleColor = (role?: string): string => {
  switch (role) {
    case "admin":
      return "green";
    case "editor":
      return "blue";
    case "viewer":
      return "orange";
    default:
      return "default";
  }
};

export const hasRole = (allowedRoles: UserRole[], user?: User | null): boolean => {
  if (!user) return false;
  return allowedRoles.includes(user.role);
};
