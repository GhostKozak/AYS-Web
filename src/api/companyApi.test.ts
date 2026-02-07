import { describe, it, expect, vi, afterEach } from "vitest";
import { companyApi } from "./companyApi";
import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

vi.mock("./apiClient", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("companyApi", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("should fetch all companies", async () => {
            const mockData = [{ _id: "1", name: "Test Corp" }];
            (apiClient.get as any).mockResolvedValue({ data: { data: mockData } });

            const result = await companyApi.getAll();

            expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.COMPANIES);
            expect(result).toEqual(mockData);
        });
    });

    describe("create", () => {
        it("should create a new company", async () => {
            const payload = { name: "New Corp" };
            const mockResponse = { success: true, data: { ...payload, _id: "2" } };
            (apiClient.post as any).mockResolvedValue({ data: mockResponse });

            const result = await companyApi.create(payload);

            expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.COMPANIES, payload);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("update", () => {
        it("should update a company", async () => {
            const id = "1";
            const payload = { name: "Updated Corp" };
            const mockResponse = { success: true };
            (apiClient.patch as any).mockResolvedValue({ data: mockResponse });

            const result = await companyApi.update(id, payload);

            expect(apiClient.patch).toHaveBeenCalledWith(`${API_ENDPOINTS.COMPANIES}/${id}`, payload);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("delete", () => {
        it("should delete a company", async () => {
            const id = "1";
            const mockResponse = { success: true };
            (apiClient.delete as any).mockResolvedValue({ data: mockResponse });

            const result = await companyApi.delete(id);

            expect(apiClient.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.COMPANIES}/${id}`);
            expect(result).toEqual(mockResponse);
        });
    });
});
