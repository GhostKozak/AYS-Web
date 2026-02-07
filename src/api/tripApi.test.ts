import { describe, it, expect, vi, afterEach } from "vitest";
import { tripApi } from "./tripApi";
import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

// Mock apiClient
vi.mock("./apiClient", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("tripApi", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("should fetch all trips", async () => {
            const mockData = [{ _id: "1", status: "WAITING" }];
            (apiClient.get as any).mockResolvedValue({ data: { data: mockData } });

            const result = await tripApi.getAll();

            expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.TRIPS);
            expect(result).toEqual(mockData);
        });
    });

    describe("create", () => {
        it("should create a new trip", async () => {
            const payload: any = { company: "123" };
            const mockResponse = { success: true, data: { ...payload, _id: "1" } };
            (apiClient.post as any).mockResolvedValue({ data: mockResponse });

            const result = await tripApi.create(payload);

            expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.TRIPS, payload);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("update", () => {
        it("should update a trip", async () => {
            const id = "1";
            const payload = { status: "UNLOADED" };
            const mockResponse = { success: true };
            (apiClient.patch as any).mockResolvedValue({ data: mockResponse });

            const result = await tripApi.update(id, payload as any);

            expect(apiClient.patch).toHaveBeenCalledWith(`${API_ENDPOINTS.TRIPS}/${id}`, payload);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("delete", () => {
        it("should delete a trip", async () => {
            const id = "1";
            const mockResponse = { success: true };
            (apiClient.delete as any).mockResolvedValue({ data: mockResponse });

            const result = await tripApi.delete(id);

            expect(apiClient.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.TRIPS}/${id}`);
            expect(result).toEqual(mockResponse);
        });
    });
});
