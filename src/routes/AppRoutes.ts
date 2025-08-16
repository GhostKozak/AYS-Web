import { createBrowserRouter } from 'react-router';
import App from '../App';
import DashboardPage from '../pages/dashboard/DashboardPage';
import LoginPage from '../pages/auth/LoginPage';
import Companies from '../pages/companies/Companies';

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
      ],
    },
  ]);
} 
  
export default AppRoutes;