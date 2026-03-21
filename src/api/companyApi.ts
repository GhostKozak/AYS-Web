import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { CreateCompanyPayload } from "../types";

export const companyApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.COMPANIES, { params: { limit: 10000 } });
    return response.data.data ?? response.data;
  },

  create: async (payload: CreateCompanyPayload) => {
    const response = await apiClient.post(API_ENDPOINTS.COMPANIES, payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<CreateCompanyPayload>) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.COMPANIES}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.COMPANIES}/${id}`);
    return response.data;
  }
};