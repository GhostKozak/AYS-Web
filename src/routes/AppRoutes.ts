import { createBrowserRouter } from 'react-router';
import App from '../App';
import DashboardPage from '../pages/dashboard/DashboardPage';
import LoginPage from '../pages/auth/LoginPage';
import Companies from '../pages/companies/Companies';
import Drivers from '../pages/drivers/Drivers';
import Vehicles from '../pages/vehicles/Vehicles';
import Trips from '../pages/trips/Trips';

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
          path: "dashboard",
          Component: DashboardPage,
        },
        {
          path: "login",
          Component: LoginPage,
        },
        {
          path: "companies",
          Component: Companies
        },
        {
          path: "drivers",
          Component: Drivers
        },
        {
          path: "vehicles",
          Component: Vehicles
        },
        {
          path: "trips",
          Component: Trips
        },
      ],
    },
  ]);
} 
  
export default AppRoutes;