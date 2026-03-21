import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

export const auditApi = {
  getAll: async (params?: { entity?: string; entityId?: string }) => {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT, { params });
    return response.data.data ?? response.data;
  }
};
