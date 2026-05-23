import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { CreateVehiclePayload, PaginatedResponse, PaginationParams } from "../types";

export const vehicleApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get(API_ENDPOINTS.VEHICLES, { params });
    const data = response.data.data ?? response.data;
    return {
      items: Array.isArray(data) ? data : [],
      total: response.data.count ?? (Array.isArray(data) ? data.length : 0),
    };
  },

  create: async (payload: CreateVehiclePayload) => {
    const response = await apiClient.post(API_ENDPOINTS.VEHICLES, payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<CreateVehiclePayload>) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.VEHICLES}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.VEHICLES}/${id}`);
    return response.data;
  }
};