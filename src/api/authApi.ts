import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';
import type { LoginPayload, LoginResponse } from '../types';
import { clearAuth } from '../utils/auth.utils';

export const authApi = {
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  /**
   * Server-side logout — invalidates the session cookie on the backend.
   * Falls back to client-side cleanup if the request fails.
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch { /* ignore */ 
    } finally {
      clearAuth();
    }
  },
};
