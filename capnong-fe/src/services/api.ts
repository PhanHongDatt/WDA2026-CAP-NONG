/**
 * Axios Instance — Cạp Nông
 * 
 * Features:
 * - Auto-attach JWT token (Authorization: Bearer ...)
 * - Auto-attach Guest-Session-Id cho cart/order
 * - Auto-refresh token khi nhận 401
 * - Retry request gốc sau khi refresh thành công
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // 8s — đủ cho API bình thường, tránh SW hiểu nhầm offline
});

/* ─── Request Interceptor ─── */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Attach JWT token
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Attach Guest-Session-Id cho cart/order (user chưa login)
      if (!token) {
        let guestId = localStorage.getItem('guest_session_id');
        if (!guestId) {
          guestId = crypto.randomUUID();
          localStorage.setItem('guest_session_id', guestId);
        }
        config.headers['Guest-Session-Id'] = guestId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response Interceptor — Auto-refresh token ─── */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Không retry cho auth endpoints (login/register/refresh)
      if (originalRequest.url?.includes('/api/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang refresh → queue request lại
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const newToken = res.data.data?.access_token || res.data.data?.accessToken || res.data.access_token || res.data.accessToken;
        const newRefresh = res.data.data?.refresh_token || res.data.data?.refreshToken || res.data.refresh_token || res.data.refreshToken;

        if (newToken) {
          localStorage.setItem('access_token', newToken);
          if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → clear tokens silently
        // Không redirect cứng → tránh page flash giữa trang bình thường và login
        // AuthContext sẽ detect user=null và handle UI phù hợp
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('capnong-user');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
