import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { PaginatedResponse, PaginationParams, User, CreateUserPayload } from "../types";

export const userApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS, { params });
    return {
      items: response.data.data ?? [],
      total: response.data.count ?? 0,
    };
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS}/${id}`);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS}/me`);
    return response.data;
  },

  updateMe: async (data: Partial<CreateUserPayload>): Promise<User> => {
    const response = await apiClient.patch(`${API_ENDPOINTS.USERS}/me`, data);
    return response.data;
  },

  create: async (data: CreateUserPayload): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS, data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateUserPayload>): Promise<User> => {
    const response = await apiClient.patch(`${API_ENDPOINTS.USERS}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.USERS}/${id}`);
  }
};
