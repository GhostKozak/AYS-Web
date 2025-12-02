import axios from 'axios';
import { ROUTES, STORAGE_KEYS } from '../constants';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı her isteğe eklemek için interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Oturum süresi doldu, çıkış yapılıyor...");

      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      //window.location.href = ROUTES.DASHBOARD;
    }
    return Promise.reject(error);
  }
);

export default apiClient;