import { STORAGE_KEYS } from "../constants";
import type { UserRole, User } from "../types";

export const getUser = (): User | null => {
  const userString = localStorage.getItem(STORAGE_KEYS.USER);
  return userString ? JSON.parse(userString) : null;
};

export const hasRole = (allowedRoles: UserRole[]): boolean => {
  const user = getUser();
  return !!user && allowedRoles.includes(user.role);
};