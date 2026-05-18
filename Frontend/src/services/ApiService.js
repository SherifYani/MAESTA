/**
 * @file ApiService.js
 * @description Base HTTP client — Axios instance with auth token injection,
 *              global 401 auto-logout, and normalized error handling.
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI)
 * @last-modified-date 2026-04-29
 */

import axios from 'axios';
import { tokenService } from '../lib/token-service';

// ─── Base URL ─────────────────────────────────────────────────────────────────
// NOTE: Base URL does NOT include /api — individual service calls prefix with /api/...
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Request Interceptor — Attach Bearer Token ────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor — Normalize Response & Handle 401 ──────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Return the full response so services can access response.data cleanly
    return response;
  },
  (error) => {
    // Auto-logout on 401 Unauthorized (expired or invalid token)
    if (error.response?.status === 401) {
      tokenService.clearToken();
      localStorage.removeItem('token');
      // Only redirect if not already on an auth page to avoid redirect loops
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgotpassword', '/resetpassword', '/verify', '/mock-login'];
      if (!authPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ─── ApiService Methods ───────────────────────────────────────────────────────
const ApiService = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),

  // Multipart upload helper (for file uploads)
  upload: (url, formData, config = {}) =>
    apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Test backend connectivity
  testConnection: () => apiClient.get('/api/health'),
};

export default ApiService;
