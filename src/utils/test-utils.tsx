import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { AppConfigProvider } from "./AppConfigProvider"; // Yolunuza göre düzenleyin
import { BrowserRouter } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Tüm sağlayıcıları (Providers) burada topluyoruz
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <AppConfigProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </AppConfigProvider>
  );
};

// Orijinal render fonksiyonunu sarmalayan yeni bir fonksiyon
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Her şeyi tekrar dışarı aktar (export)
export * from "@testing-library/react";
export { customRender as render };
