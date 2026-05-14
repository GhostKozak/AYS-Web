import axios from 'axios';
import { CONFIG } from '../constants';

// Cookie-based auth: withCredentials sends the HttpOnly session cookie
// automatically on every request. No Authorization header needed.
const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;