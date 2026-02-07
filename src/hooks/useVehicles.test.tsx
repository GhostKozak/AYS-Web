import React from "react"; // <-- BU SATIR EKSİKTİ, EKLENDİ
import { renderHook, waitFor } from "@testing-library/react";
import { useVehicles } from "./useVehicles";
import { vehicleApi } from "../api/vehicleApi";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AppConfigProvider } from "../utils/AppConfigProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. API Mock (Aynı kalıyor)
vi.mock("../api/vehicleApi", () => ({
  vehicleApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// 2. Wrapper Oluşturucu (Düzeltildi)
const createWrapper = () => {
  // Her test için taze bir QueryClient oluşturuyoruz
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Testlerde hata alınca tekrar denemesin, testi yavaşlatır
      },
    },
  });

  // Wrapper bileşeni döndürüyoruz
  // React.ReactNode kullanımı için yukarıda 'import React' olması şarttır
  return ({ children }: { children: React.ReactNode }) => (
    <AppConfigProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppConfigProvider>
  );
};

describe("useVehicles Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("başlangıçta loading durumunda olmalı ve verileri çekmeli", async () => {
    const mockVehicles = [
      { id: "1", licence_plate: "34ABC123", vehicle_type: "TRUCK" },
    ];
    vi.mocked(vehicleApi.getAll).mockResolvedValue(mockVehicles as any);

    // wrapper: createWrapper() fonksiyonunu çağırıp dönen bileşeni veriyoruz
    const { result } = renderHook(() => useVehicles(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.vehicles).toHaveLength(1);
    expect(result.current.vehicles[0].licence_plate).toBe("34ABC123");
  });

  it("createVehicle fonksiyonu API yi çağırmalı", async () => {
    vi.mocked(vehicleApi.create).mockResolvedValue({ id: "2" } as any);

    const { result } = renderHook(() => useVehicles(), {
      wrapper: createWrapper(),
    });

    const newVehicle = { licence_plate: "35IZM35", vehicle_type: "VAN" };

    await result.current.createVehicle(newVehicle as any);

    expect(vehicleApi.create).toHaveBeenCalledWith(newVehicle);
  });

  it("deleteVehicle fonksiyonu API yi çağırmalı", async () => {
    vi.mocked(vehicleApi.delete).mockResolvedValue(true as any);

    const { result } = renderHook(() => useVehicles(), {
      wrapper: createWrapper(),
    });

    await result.current.deleteVehicle("123");

    expect(vehicleApi.delete).toHaveBeenCalledWith("123");
  });
});
