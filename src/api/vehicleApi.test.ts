import { describe, it, expect, vi, beforeEach } from "vitest";
import { vehicleApi } from "./vehicleApi";
import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

vi.mock("./apiClient");

describe("vehicleApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch all vehicles", async () => {
        const mockData = { data: { data: [{ id: "1", plate: "34ABC123" }] } };
        vi.mocked(apiClient.get).mockResolvedValue(mockData);

        const result = await vehicleApi.getAll();

        expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.VEHICLES);
        expect(result).toEqual(mockData.data.data);
    });

    it("should create a vehicle", async () => {
        const mockPayload = { plate: "35XYZ789" };
        const mockResponse = { data: { id: "2", ...mockPayload } };
        vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

        const result = await vehicleApi.create(mockPayload as any);

        expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.VEHICLES, mockPayload);
        expect(result).toEqual(mockResponse.data);
    });

    it("should update a vehicle", async () => {
        const mockPayload = { plate: "35XYZ789 Updated" };
        const mockResponse = { data: { id: "2", ...mockPayload } };
        vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

        await vehicleApi.update("2", mockPayload);

        expect(apiClient.patch).toHaveBeenCalledWith(`${API_ENDPOINTS.VEHICLES}/2`, mockPayload);
    });

    it("should delete a vehicle", async () => {
        const mockResponse = { data: { success: true } };
        vi.mocked(apiClient.delete).mockResolvedValue(mockResponse);

        await vehicleApi.delete("2");

        expect(apiClient.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.VEHICLES}/2`);
    });
});
