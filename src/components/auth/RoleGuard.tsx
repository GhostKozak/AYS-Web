import type { ReactNode } from "react";
import { STORAGE_KEYS } from "../../constants";
import type { UserRole, User } from "../../types";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) => {
  const userString = localStorage.getItem(STORAGE_KEYS.USER);
  const user: User | null = userString ? JSON.parse(userString) : null;

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
