import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import "./i18n";
import "./styles/base.css";
import { CustomThemeProvider } from "./utils/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <CustomThemeProvider>
    <RouterProvider router={AppRoutes()} />
  </CustomThemeProvider>
);
