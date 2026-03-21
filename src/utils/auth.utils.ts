import { STORAGE_KEYS } from "../constants";
import type { UserRole, User } from "../types";

export const getUser = (): User | null => {
  const userString = sessionStorage.getItem(STORAGE_KEYS.USER);
  if (!userString) return null;
  
  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error("Failed to parse user from storage:", error);
    return null;
  }
};

export const setUser = (user: User): void => {
  sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getToken = (): string | null => {
  return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const setToken = (token: string): void => {
  sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const clearAuth = (): void => {
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.USER);
};

export const isLoggedIn = (): boolean => {
  return !!getToken() && !!getUser();
};

export const hasRole = (allowedRoles: UserRole[]): boolean => {
  const user = getUser();
  return !!user && allowedRoles.includes(user.role);
};