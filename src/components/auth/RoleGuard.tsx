import type { ReactNode } from "react";
import type { UserRole } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { hasRole } from "../../utils/auth.utils";

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
  const { user } = useAuth();

  if (!user || !hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
