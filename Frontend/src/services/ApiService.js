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
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5024';

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
// NOTE: When the backend is unavailable, individual services fall back to
//       mock data (see mockData.js). The interceptor avoids false redirects.
apiClient.interceptors.response.use(
  (response) => {
    // Return the full response so services can access response.data cleanly
    return response;
  },
  (error) => {
    const isNetworkError = error.isAxiosError && !error.response;

    // Auto-logout on 401 Unauthorized — but ONLY when the backend is reachable.
    // If it's a network error the backend is simply down; mock fallback will handle it.
    if (!isNetworkError && error.response?.status === 401) {
      tokenService.clearToken();
      localStorage.removeItem('token');
      // Only redirect if not already on an auth page to avoid redirect loops
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgotpassword', '/resetpassword', '/verify'];
      if (!authPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }

    if (isNetworkError) {
      // Backend is offline — services will return mock data instead
      console.warn('[ApiService] Backend unreachable — mock data fallback active.');
    } else if (error.response?.status === 404) {
      // 404 = expected "not found" (e.g. no active subscription) — use warn, not error
      console.warn('API 404:', error.config?.url, error.response?.data?.message || 'Not found');
    } else {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
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
