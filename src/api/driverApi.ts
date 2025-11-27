import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

export const driverApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.DRIVERS);
    return response.data.data;
  },

  create: async (payload: { full_name: string; phone_number: string; company: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.DRIVERS, payload);
    return response.data;
  },

  update: async (id: string, payload: { full_name: string; phone_number: string; company: string }) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.DRIVERS}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.DRIVERS}/${id}`);
    return response.data;
  }
};