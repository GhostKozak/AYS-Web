import { createBrowserRouter } from 'react-router';
import App from '../App';
import DashboardPage from '../pages/dashboard/DashboardPage';
import LoginPage from '../pages/auth/LoginPage';
import Companies from '../pages/companies/Companies';
import Drivers from '../pages/drivers/Drivers';
import Vehicles from '../pages/vehicles/Vehicles';
import Trips from '../pages/trips/Trips';
import { ROUTES } from '../constants';

function AppRoutes() {
  return createBrowserRouter([
    {
      path: "/",
      Component: App,
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
          Component: Companies
        },
        {
          path: ROUTES.DRIVERS,
          Component: Drivers
        },
        {
          path: ROUTES.VEHICLES,
          Component: Vehicles
        },
        {
          path: ROUTES.TRIPS,
          Component: Trips
        },
      ],
    },
  ]);
} 
  
export default AppRoutes;