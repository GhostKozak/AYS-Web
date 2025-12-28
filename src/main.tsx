import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import "./i18n";
import "./styles/base.css";
import { AppConfigProvider } from "./utils/AppConfigProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntdApp } from "antd";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <AppConfigProvider>
    <AntdApp>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={AppRoutes()} />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      </QueryClientProvider>
    </AntdApp>
  </AppConfigProvider>
);

//* for the React Query Devtools extension.
//TODO: Delete before productions
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;
