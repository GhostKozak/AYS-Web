import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';
import type { LoginPayload, LoginResponse } from '../types';
import { clearAuth } from '../utils/auth.utils';

export const authApi = {
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  logout: () => {
    clearAuth();
    window.location.href = '/login';
  }
};
