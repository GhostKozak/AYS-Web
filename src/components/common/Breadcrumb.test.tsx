import { render, screen } from "../../utils/test-utils";
import Breadcrumb from "./Breadcrumb";
import { vi } from "vitest";
import * as router from "react-router";

// 1. useLocation'ı mockluyoruz
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

// 2. ROUTES sabitlerini mockluyoruz ki import hatası almayalım
vi.mock("../../constants", () => ({
  ROUTES: {
    DASHBOARD: "/dashboard",
    LOGIN: "/login",
    COMPANIES: "/companies",
    DRIVERS: "/drivers",
    VEHICLES: "/vehicles",
    TRIPS: "/trips",
    FAQ: "/faq",
  },
}));

describe("Breadcrumb Component", () => {
  it("Anasayfa linkini her zaman göstermeli", () => {
    // URL'i simüle ediyoruz: /
    vi.spyOn(router, "useLocation").mockReturnValue({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<Breadcrumb />);

    // Kodunda "Breadcrumbs.HOMEPAGE" kullanıyorsun.
    // Test setup dosyamızdaki mock çeviri sayesinde bu key ekrana basılacak.
    expect(screen.getByRole("link", { name: /homepage/i })).toBeInTheDocument();
  });

  it("Alt sayfalarda (Nested Routes) doğru yolu göstermeli", () => {
    // URL'i simüle ediyoruz: /companies/new
    vi.spyOn(router, "useLocation").mockReturnValue({
      pathname: "/companies/new",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<Breadcrumb />);

    // 1. Home Linki
    expect(screen.getByRole("link", { name: /homepage/i })).toBeInTheDocument();

    // 2. "Companies" Linki (Aradaki segment olduğu için tıklanabilir olmalı)
    // Kodundaki mantık: ROUTES.COMPANIES (/companies) -> "Breadcrumbs.COMPANIES"
    expect(
      screen.getByRole("link", { name: /companies/i }),
    ).toBeInTheDocument();

    // 3. "new" Segmenti (Son segment olduğu için link OLMAMALI, düz yazı olmalı)
    // Kodundaki fallback mantığı: new -> New
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "New" })).not.toBeInTheDocument();
  });
});
