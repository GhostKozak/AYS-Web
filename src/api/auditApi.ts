import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { PaginatedResponse, PaginationParams } from "../types";

export const auditApi = {
  getAll: async (params?: PaginationParams & { entity?: string; entityId?: string }): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT, { params });
    return {
      items: response.data.data ?? [],
      total: response.data.count ?? 0,
    };
  }
};
