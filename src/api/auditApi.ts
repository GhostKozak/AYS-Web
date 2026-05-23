import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { PaginatedResponse, PaginationParams } from "../types";

export const auditApi = {
  getAll: async (params?: PaginationParams & { entity?: string; entityId?: string }): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT, { params });
    const data = response.data.data ?? response.data;
    return {
      items: Array.isArray(data) ? data : [],
      total: response.data.count ?? (Array.isArray(data) ? data.length : 0),
    };
  }
};
