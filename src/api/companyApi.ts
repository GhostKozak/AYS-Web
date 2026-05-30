import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { CompanyType, CreateCompanyPayload, PaginatedResponse, PaginationParams } from "../types";

import { asyncSearch } from "./asyncSearch";

export const companyApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<CompanyType>> => {
    return asyncSearch("companies", params || {});
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