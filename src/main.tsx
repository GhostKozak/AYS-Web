import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import "./i18n";
import "./styles/base.css";
import { CustomThemeProvider } from "./utils/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <CustomThemeProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRoutes()} />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  </CustomThemeProvider>
);

//* for the React Query Devtools extension.
//TODO: Delete before productions
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;
