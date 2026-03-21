import { createBrowserRouter } from "react-router";
import App from "../App";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../pages/auth/LoginPage";
import Companies from "../pages/companies/Companies";
import Drivers from "../pages/drivers/Drivers";
import Vehicles from "../pages/vehicles/Vehicles";
import Trips from "../pages/trips/Trips";
import NotFoundPage from "../pages/common/NotFoundPage";
import ErrorPage from "../pages/common/ErrorPage";
import { ROUTES } from "../constants";
import FAQ from "../pages/FAQ";
import FieldDashboard from "../pages/field/FieldDashboard";
import AuditPage from "../pages/common/AuditPage";
import UserManagementPage from "../pages/common/UserManagementPage";
import { AuthGuard } from "../components/auth/AuthGuard";
import { RoleGuard } from "../components/auth/RoleGuard";
import { UserRole } from "../types";

function AppRoutes() {
  return createBrowserRouter([
    {
      path: ROUTES.LOGIN,
      Component: LoginPage,
      errorElement: <ErrorPage />,
    },
    {
      path: "/",
      element: (
        <AuthGuard>
          <App />
        </AuthGuard>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          Component: DashboardPage,
        },
        {
          path: ROUTES.DASHBOARD,
          Component: DashboardPage,
        },
        {
          path: ROUTES.COMPANIES,
          Component: Companies,
        },
        {
          path: ROUTES.DRIVERS,
          Component: Drivers,
        },
        {
          path: ROUTES.VEHICLES,
          Component: Vehicles,
        },
        {
          path: ROUTES.TRIPS,
          Component: Trips,
        },
        {
          path: ROUTES.FAQ,
          Component: FAQ,
        },
        {
          path: ROUTES.FIELD_OPS,
          Component: FieldDashboard,
        },
        {
          path: ROUTES.AUDIT,
          element: (
            <RoleGuard allowedRoles={[UserRole.ADMIN]}>
              <AuditPage />
            </RoleGuard>
          ),
        },
        {
          path: ROUTES.USERS,
          element: (
            <RoleGuard allowedRoles={[UserRole.ADMIN]}>
              <UserManagementPage />
            </RoleGuard>
          ),
        },
        {
          path: "*",
          Component: NotFoundPage,
        },
      ],
    },
  ]);
}

export default AppRoutes;
