import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';
import type { LoginPayload, LoginResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  logout: () => {
    // Backend doesn't have a logout endpoint, so we just clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
