import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { CreateVehiclePayload } from "../types";

export const vehicleApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.VEHICLES);
    return response.data.data;
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