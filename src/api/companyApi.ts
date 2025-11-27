import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

export const companyApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.COMPANIES);
    return response.data.data;
  },

  create: async (name: string) => {
    const response = await apiClient.post(API_ENDPOINTS.COMPANIES, { name });
    return response.data;
  },

  update: async (id: string, name: string) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.COMPANIES}/${id}`, { name });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.COMPANIES}/${id}`);
    return response.data;
  }
};