import axios from 'axios';
import { CONFIG } from '../constants';
import { getToken } from '../utils/auth.utils';

const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı her isteğe eklemek için interceptor
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;