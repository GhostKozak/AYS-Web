import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { CreateTripPayload } from "../types";

export const tripApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TRIPS);
    return response.data.data;
  },

  create: async (payload: CreateTripPayload) => {
    const response = await apiClient.post(API_ENDPOINTS.TRIPS, payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<CreateTripPayload>) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.TRIPS}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.TRIPS}/${id}`);
    return response.data;
  }
};