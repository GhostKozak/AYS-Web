import { renderHook, waitFor } from "@testing-library/react";
import { useDrivers } from "./useDrivers";
import { driverApi } from "../api/driverApi";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";

// Mock driverApi
vi.mock("../api/driverApi", () => ({
    driverApi: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe("useDrivers Hook", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Default mock implementation to return empty array to avoid undefined errors
        (driverApi.getAll as any).mockResolvedValue([]);
    });

    it("should fetch drivers successfully", async () => {
        const mockDrivers = [
            { id: "1", name: "Driver 1", phone: "123", email: "test@test.com" },
            { id: "2", name: "Driver 2", phone: "456", email: "test2@test.com" },
        ];

        (driverApi.getAll as any).mockResolvedValue(mockDrivers);

        const { result } = renderHook(() => useDrivers(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.drivers).toEqual(mockDrivers);
        expect(driverApi.getAll).toHaveBeenCalledTimes(1);
    });

    it("should handle error when fetching drivers", async () => {
        (driverApi.getAll as any).mockRejectedValue(new Error("Failed to fetch"));

        const { result } = renderHook(() => useDrivers(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.isError).toBe(true);
        expect(result.current.drivers).toEqual([]);
    });

    it("should create a driver successfully", async () => {
        const newDriver = { name: "New Driver", phone: "789", email: "new@test.com" };
        (driverApi.create as any).mockResolvedValue({ id: "3", ...newDriver });

        const { result } = renderHook(() => useDrivers(), {
            wrapper: createWrapper(),
        });

        // Wait for initial fetch to complete
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await result.current.createDriver(newDriver);

        expect(driverApi.create).toHaveBeenCalledWith(newDriver);
    });

    it("should update a driver successfully", async () => {
        const updateData = { id: "1", name: "Updated Driver" };
        (driverApi.update as any).mockResolvedValue({ ...updateData, phone: "123" });

        const { result } = renderHook(() => useDrivers(), {
            wrapper: createWrapper(),
        });

        // Wait for initial fetch to complete
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await result.current.updateDriver(updateData);

        expect(driverApi.update).toHaveBeenCalledWith("1", { name: "Updated Driver" });
    });

    it("should delete a driver successfully", async () => {
        (driverApi.delete as any).mockResolvedValue(true);

        const { result } = renderHook(() => useDrivers(), {
            wrapper: createWrapper(),
        });

        // Wait for initial fetch to complete
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await result.current.deleteDriver("1");

        expect(driverApi.delete).toHaveBeenCalledWith("1");
    });
});
