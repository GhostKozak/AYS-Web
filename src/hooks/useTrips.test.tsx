import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useTrips } from "./useTrips";
import { tripApi } from "../api/tripApi";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AppConfigProvider } from "../utils/AppConfigProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock API
vi.mock("../api/tripApi", () => ({
    tripApi: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Wrapper
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <AppConfigProvider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </AppConfigProvider>
    );
};

describe("useTrips Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch trips successfully", async () => {
        const mockTrips = [{ id: "1", status: "WAITING" }];
        vi.mocked(tripApi.getAll).mockResolvedValue(mockTrips as any);

        const { result } = renderHook(() => useTrips(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.trips).toHaveLength(1);
        expect(result.current.trips[0].id).toBe("1");
    });

    it("should handle create trip", async () => {
        vi.mocked(tripApi.create).mockResolvedValue({ id: "2" } as any);

        const { result } = renderHook(() => useTrips(), {
            wrapper: createWrapper(),
        });

        await result.current.createTrip({ someData: "test" } as any);

        expect(tripApi.create).toHaveBeenCalledWith({ someData: "test" });
    });

    it("should handle update trip", async () => {
        vi.mocked(tripApi.update).mockResolvedValue({ id: "1", status: "COMPLETED" } as any);

        const { result } = renderHook(() => useTrips(), {
            wrapper: createWrapper(),
        });

        await result.current.updateTrip({ id: "1", status: "COMPLETED" } as any);

        expect(tripApi.update).toHaveBeenCalledWith("1", { status: "COMPLETED" });
    });

    it("should handle delete trip", async () => {
        vi.mocked(tripApi.delete).mockResolvedValue(true as any);

        const { result } = renderHook(() => useTrips(), {
            wrapper: createWrapper(),
        });

        await result.current.deleteTrip("1");

        expect(tripApi.delete).toHaveBeenCalledWith("1");
    });
});
