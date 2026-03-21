import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { CreateDriverPayload } from "../types";

export const driverApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.DRIVERS, { params: { limit: 10000 } });
    return response.data.data ?? response.data;
  },

  create: async (payload: CreateDriverPayload) => {
    const response = await apiClient.post(API_ENDPOINTS.DRIVERS, payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<CreateDriverPayload>) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.DRIVERS}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.DRIVERS}/${id}`);
    return response.data;
  }
};