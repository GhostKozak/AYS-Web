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

function AppRoutes() {
  return createBrowserRouter([
    {
      path: "/",
      Component: App,
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
          path: ROUTES.LOGIN,
          Component: LoginPage,
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
          path: "*",
          Component: NotFoundPage,
        },
      ],
    },
  ]);
}

export default AppRoutes;
