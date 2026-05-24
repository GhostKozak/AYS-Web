import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { CreateTripPayload, PaginatedResponse, PaginationParams } from "../types";

import { asyncSearch } from "./asyncSearch";

export const tripApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    return asyncSearch("trips", params || {});
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
  },

  getPendingVerification: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.TRIPS}/pending-verification`);
    return response.data.data ?? response.data;
  },

  fieldVerify: async (id: string, photo: File, sealNumber?: string) => {
    const formData = new FormData();
    formData.append("photo", photo);
    if (sealNumber) {
      formData.append("seal_number", sealNumber);
    }
    const response = await apiClient.post(
      `${API_ENDPOINTS.TRIPS}/${id}/field-verify`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }
};