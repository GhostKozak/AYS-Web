import { STORAGE_KEYS } from "../constants";
import type { UserRole, User } from "../types";

// ---------------------------------------------------------------------------
// User (localStorage) — used as a cache/initialData for useAuth's useQuery
// ---------------------------------------------------------------------------

// ⚠️ SECURITY: Only non-sensitive fields are cached in localStorage.
// must come from the server (cookie-based session), never from localStorage for actual API calls.
// However, UI routing relies on localStorage cache to prevent flickering.
const SANITIZED_FIELDS = new Set(["_id", "email", "firstName", "lastName", "role"]);

export const getUser = (): User | null => {
  const userString = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userString) return null;
  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

export const setUser = (user: User): void => {
  const sanitized: Record<string, unknown> = {};
  for (const key of Object.keys(user)) {
    if (SANITIZED_FIELDS.has(key)) {
      sanitized[key] = (user as unknown as Record<string, unknown>)[key];
    }
  }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sanitized));
};

export const clearAuth = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  // ACCESS_TOKEN key kept for safety (no-op if it doesn't exist)
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// ---------------------------------------------------------------------------
// Role helpers — always operate on the provided user object (no localStorage
// fallback for role, to prevent stale / tampered data being used for authz)
// ---------------------------------------------------------------------------

export const hasRole = (allowedRoles: UserRole[], user?: User | null): boolean => {
  if (!user) return false;
  return allowedRoles.includes(user.role);
};
