import { describe, it, expect, vi, beforeEach } from "vitest";
import { driverApi } from "./driverApi";
import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

vi.mock("./apiClient");

describe("driverApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch all drivers", async () => {
        const mockData = { data: { data: [{ id: "1", name: "John Doe" }] } };
        vi.mocked(apiClient.get).mockResolvedValue(mockData);

        const result = await driverApi.getAll();

        expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.DRIVERS);
        expect(result).toEqual(mockData.data.data);
    });

    it("should create a driver", async () => {
        const mockPayload = { name: "Jane Doe", phone: "1234567890" };
        const mockResponse = { data: { id: "2", ...mockPayload } };
        vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

        const result = await driverApi.create(mockPayload as any);

        expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.DRIVERS, mockPayload);
        expect(result).toEqual(mockResponse.data);
    });

    it("should update a driver", async () => {
        const mockPayload = { name: "Jane Doe Updated" };
        const mockResponse = { data: { id: "2", ...mockPayload } };
        vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

        await driverApi.update("2", mockPayload);

        expect(apiClient.patch).toHaveBeenCalledWith(`${API_ENDPOINTS.DRIVERS}/2`, mockPayload);
    });

    it("should delete a driver", async () => {
        const mockResponse = { data: { success: true } };
        vi.mocked(apiClient.delete).mockResolvedValue(mockResponse);

        await driverApi.delete("2");

        expect(apiClient.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.DRIVERS}/2`);
    });
});
