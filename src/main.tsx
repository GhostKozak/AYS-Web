import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import "./i18n";
import "./styles/base.css";
import { CustomThemeProvider } from "./utils/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <CustomThemeProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRoutes()} />
    </QueryClientProvider>
  </CustomThemeProvider>
);
