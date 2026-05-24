import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import type { UserRole } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  /**
   * Rendered when the user is logged in but lacks the required role.
   * Defaults to a redirect to /dashboard (rather than a blank page).
   */
  fallback?: ReactNode;
  /** When true, redirects to /dashboard instead of rendering the fallback */
  redirectOnDenied?: boolean;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallback,
  redirectOnDenied = true,
}: RoleGuardProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in — AuthGuard should have caught this, but guard defensively
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If role is undefined, wait for the background query to update the cache
  if (!user.role) {
    return null;
  }

  // Logged in but wrong role
  if (!allowedRoles.includes(user.role)) {
    if (fallback !== undefined) return <>{fallback}</>;
    if (redirectOnDenied) return <Navigate to={ROUTES.DASHBOARD} replace />;
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;
