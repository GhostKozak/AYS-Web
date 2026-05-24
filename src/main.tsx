import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import "./i18n";
import "./styles/base.css";
import { AppConfigProvider } from "./utils/AppConfigProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntdApp } from "antd";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Don't aggressively retry on 429
    },
  },
});
const router = AppRoutes();

createRoot(document.getElementById("root")!).render(
  <AppConfigProvider>
    <AntdApp notification={{ top: 70 }} message={{ top: 70 }}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        )}
      </QueryClientProvider>
    </AntdApp>
  </AppConfigProvider>
);

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

// React Query Devtools global client for development
if (import.meta.env.DEV) {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}
