import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useCompanies } from "./useCompanies";
import { companyApi } from "../api/companyApi";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AppConfigProvider } from "../utils/AppConfigProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock API
vi.mock("../api/companyApi", () => ({
    companyApi: {
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

describe("useCompanies Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch companies successfully", async () => {
        const mockCompanies = [{ id: "1", name: "Company A" }];
        vi.mocked(companyApi.getAll).mockResolvedValue(mockCompanies as any);

        const { result } = renderHook(() => useCompanies(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.companies).toHaveLength(1);
        expect(result.current.companies[0].name).toBe("Company A");
    });

    it("should handle create company", async () => {
        vi.mocked(companyApi.create).mockResolvedValue({ id: "2" } as any);

        const { result } = renderHook(() => useCompanies(), {
            wrapper: createWrapper(),
        });

        await result.current.createCompany({ name: "New Company" } as any);

        expect(companyApi.create).toHaveBeenCalledWith({ name: "New Company" });
    });

    it("should handle update company", async () => {
        vi.mocked(companyApi.update).mockResolvedValue({ id: "1", name: "Updated Company" } as any);

        const { result } = renderHook(() => useCompanies(), {
            wrapper: createWrapper(),
        });

        await result.current.updateCompany({ id: "1", name: "Updated Company" } as any);

        expect(companyApi.update).toHaveBeenCalledWith("1", { name: "Updated Company" });
    });

    it("should handle delete company", async () => {
        vi.mocked(companyApi.delete).mockResolvedValue(true as any);

        const { result } = renderHook(() => useCompanies(), {
            wrapper: createWrapper(),
        });

        await result.current.deleteCompany("1");

        expect(companyApi.delete).toHaveBeenCalledWith("1");
    });
});
