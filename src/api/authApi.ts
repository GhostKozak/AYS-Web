import apiClient from './apiClient';
import { API_ENDPOINTS, ROUTES } from '../constants';
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
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors; we still clear local state below
    } finally {
      clearAuth();
      // Use React Router history if available, otherwise hard-navigate
      window.location.href = ROUTES.LOGIN;
    }
  },
};
