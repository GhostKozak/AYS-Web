import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants";
import { Spin, Flex } from "antd";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: "100vh", width: "100vw" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (!user) {
    // Redirect to login but save the current location to come back after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
