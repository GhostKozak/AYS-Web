import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AppRoutes from "./routes/AppRoutes";
import "./i18n";
import "./base.css";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={AppRoutes()} />
);
