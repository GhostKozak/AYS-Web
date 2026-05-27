import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import "./i18n";
import "./styles/base.css";
import { AppConfigProvider } from "./utils/AppConfigProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntdApp, Button, Result } from "antd";
import ErrorBoundary from "./components/common/ErrorBoundary";

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

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element '#root' not found in index.html");
}

createRoot(rootEl).render(
  <ErrorBoundary
    fallback={
      <Result
        status="500"
        title="Uygulama Hatası"
        subTitle="Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin."
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </Button>
        }
      />
    }
  >
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
  </ErrorBoundary>
);

// React Query Devtools global client for development
if (import.meta.env.DEV) {
  (window as any).__TANSTACK_QUERY_CLIENT__ = queryClient;
}
