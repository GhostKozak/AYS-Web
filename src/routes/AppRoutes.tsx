import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import App from "../App";
import LoginPage from "../pages/auth/LoginPage";
import { ROUTES } from "../constants";
import { AuthGuard } from "../components/auth/AuthGuard";
import { RoleGuard } from "../components/auth/RoleGuard";
import { USER_ROLES } from "../types";
import { PageLoader } from "../components/common/PageLoader";
import ErrorPage from "../pages/common/ErrorPage";

// Lazy-loaded pages — her biri ayrı JS chunk olarak yüklenir
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const Companies = lazy(() => import("../pages/companies/Companies"));
const Drivers = lazy(() => import("../pages/drivers/Drivers"));
const Vehicles = lazy(() => import("../pages/vehicles/Vehicles"));
const Trips = lazy(() => import("../pages/trips/Trips"));
const FAQ = lazy(() => import("../pages/FAQ"));
const FieldDashboard = lazy(() => import("../pages/field/FieldDashboard"));
const AuditPage = lazy(() => import("../pages/common/AuditPage"));
const UserManagementPage = lazy(() => import("../pages/common/UserManagementPage"));
const ProfilePage = lazy(() => import("../pages/profile/Profile"));
const NotFoundPage = lazy(() => import("../pages/common/NotFoundPage"));

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
          element: (
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.DASHBOARD,
          element: (
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.COMPANIES,
          element: (
            <Suspense fallback={<PageLoader />}>
              <Companies />
            </Suspense>
          ),
        },
        {
          path: ROUTES.DRIVERS,
          element: (
            <Suspense fallback={<PageLoader />}>
              <Drivers />
            </Suspense>
          ),
        },
        {
          path: ROUTES.VEHICLES,
          element: (
            <Suspense fallback={<PageLoader />}>
              <Vehicles />
            </Suspense>
          ),
        },
        {
          path: ROUTES.TRIPS,
          element: (
            <Suspense fallback={<PageLoader />}>
              <Trips />
            </Suspense>
          ),
        },
        {
          path: ROUTES.FAQ,
          element: (
            <Suspense fallback={<PageLoader />}>
              <FAQ />
            </Suspense>
          ),
        },
        {
          path: ROUTES.FIELD_OPS,
          element: (
            <Suspense fallback={<PageLoader />}>
              <FieldDashboard />
            </Suspense>
          ),
        },
        {
          path: ROUTES.AUDIT,
          element: (
            <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
              <Suspense fallback={<PageLoader />}>
                <AuditPage />
              </Suspense>
            </RoleGuard>
          ),
        },
        {
          path: ROUTES.USERS,
          element: (
            <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
              <Suspense fallback={<PageLoader />}>
                <UserManagementPage />
              </Suspense>
            </RoleGuard>
          ),
        },
        {
          path: ROUTES.PROFILE,
          element: (
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          ),
        },
        {
          path: "*",
          element: (
            <Suspense fallback={<PageLoader />}>
              <NotFoundPage />
            </Suspense>
          ),
        },
      ],
    },
  ]);
}

export default AppRoutes;

