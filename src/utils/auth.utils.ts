import { STORAGE_KEYS } from "../constants";
import type { UserRole, User } from "../types";

export const getUser = (): User | null => {
  const userString = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userString) return null;
  
  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error("Failed to parse user from storage:", error);
    return null;
  }
};

export const setUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const getRoleFromToken = (token: string | null): UserRole | null => {
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.role || null;
  } catch (error) {
    console.error("Failed to decode token role:", error);
    return null;
  }
};

export const setToken = (_token: string): void => {
  // Artik token localStorage'da saklanmıyor (HttpOnly Cookie kullanılıyor)
  // console.debug("Token received, but not stored in localStorage for security.");
};

export const clearAuth = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const isLoggedIn = (): boolean => {
  return !!getToken() && !!getUser();
};

export const hasRole = (allowedRoles: UserRole[]): boolean => {
  const token = getToken();
  const roleFromToken = getRoleFromToken(token);
  const user = getUser();
  
  // Güvenlik: Öncelikli olarak token içindeki role bilgisini kullan (tamper-proof)
  const effectiveRole = roleFromToken || user?.role;
  return !!effectiveRole && allowedRoles.includes(effectiveRole as UserRole);
};