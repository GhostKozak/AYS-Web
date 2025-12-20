import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";
import type { VehicleType } from "../types";

export const tripApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TRIPS);
    return response.data.data;
  },

  create: async (payload: { driver_phone_number: string, driver_full_name: string, company_name: string, licence_plate: string, vehicle_type?: VehicleType, notes?: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.TRIPS, payload);
    return response.data;
  },

  update: async (id: string, payload: { }) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.TRIPS}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.TRIPS}/${id}`);
    return response.data;
  }
};