/**
 * API Service Layer — Cạp Nông Frontend
 *
 * Centralized fetch wrapper. Khi BE ready, chỉ cần:
 * 1. Đổi API_BASE_URL trong .env
 * 2. Gọi các hàm trong file này thay vì mock data
 */

const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer ? (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1") : "/api/v1";

/* ────────────── Types ────────────── */

interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/* ────────────── Token management ────────────── */

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

/* ────────────── Core fetch wrapper ────────────── */

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string>;
      auth?: boolean;
    }
  ): Promise<T> {
    const { body, params, auth = true } = options || {};

    // Build URL with query params
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    // Headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth) {
      const token = getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 → try refresh
    if (res.status === 401 && auth) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry with new token
        headers["Authorization"] = `Bearer ${getAccessToken()}`;
        const retry = await fetch(url.toString(), {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!retry.ok) throw await this.parseError(retry);
        return retry.json();
      }
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    if (!res.ok) throw await this.parseError(res);
    
    // 204 No Content
    if (res.status === 204) return undefined as T;
    
    return res.json();
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  private async parseError(res: Response): Promise<ApiError> {
    try {
      const body = await res.json();
      return { status: res.status, message: body.message || res.statusText, details: body.details };
    } catch {
      return { status: res.status, message: res.statusText };
    }
  }

  // HTTP method shortcuts
  get<T>(path: string, params?: Record<string, string>) {
    return this.request<T>("GET", path, { params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, { body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, { body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>("PATCH", path, { body });
  }

  delete<T>(path: string) {
    return this.request<T>("DELETE", path);
  }
}

/* ────────────── Singleton instance ────────────── */

export const api = new ApiClient(API_BASE_URL);

/* ────────────── Domain-specific endpoints ────────────── */

// Auth
export const authApi = {
  login: (phone: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string; user: unknown }>("/auth/login", { phone, password }),
  register: (data: { phone: string; password: string; full_name: string; role: string }) =>
    api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// Products
export const productApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<unknown>>("/products", params),
  get: (slug: string) =>
    api.get<ApiResponse<unknown>>(`/products/${slug}`),
  create: (data: unknown) => api.post("/products", data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Orders
export const orderApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<unknown>>("/orders", params),
  get: (id: string) => api.get<ApiResponse<unknown>>(`/orders/${id}`),
  create: (data: unknown) => api.post("/orders", data),
  cancel: (id: string, reason: string) =>
    api.patch(`/orders/${id}/cancel`, { reason }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  lookupGuest: (phone: string, orderId: string) =>
    api.get<ApiResponse<unknown>>("/orders/lookup", { phone, order_id: orderId }),
};

// Shops
export const shopApi = {
  get: (slug: string) => api.get<ApiResponse<unknown>>(`/shops/${slug}`),
  create: (data: unknown) => api.post("/shops", data),
  getHtx: (slug: string) => api.get<ApiResponse<unknown>>(`/shops/htx/${slug}`),
};

// HTX
export const htxApi = {
  create: (data: unknown) => api.post("/htx", data),
  join: (htxId: string) => api.post(`/htx/${htxId}/join`),
  listActive: () => api.get<ApiResponse<unknown[]>>("/htx/active"),
  manage: (htxId: string) => api.get<ApiResponse<unknown>>(`/htx/${htxId}/manage`),
};

// Bundles
export const bundleApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<unknown>>("/bundles", params),
  pledge: (bundleId: string, qty: number) =>
    api.post(`/bundles/${bundleId}/pledge`, { quantity_kg: qty }),
  cancelPledge: (bundleId: string) =>
    api.delete(`/bundles/${bundleId}/pledge`),
};

// Reviews
export const reviewApi = {
  create: (data: { order_item_id: string; rating: number; comment: string }) =>
    api.post("/reviews", data),
  sellerReply: (reviewId: string, reply: string) =>
    api.post(`/reviews/${reviewId}/reply`, { reply }),
};

// AI Services
export const aiApi = {
  voiceToProduct: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    return fetch(`${API_BASE_URL}/ai/voice-to-product`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: formData,
    }).then((r) => r.json());
  },
  refineDescription: (text: string) =>
    api.post<ApiResponse<{ refined: string; changes: string[] }>>("/ai/refine", { text }),
  generateCaption: (productName: string, style: string) =>
    api.post<ApiResponse<{ captions: string[] }>>("/ai/caption", { product_name: productName, style }),
  removeBackground: (imageUrl: string) =>
    api.post<ApiResponse<{ result_url: string }>>("/ai/remove-bg", { image_url: imageUrl }),
};

// Notifications
export const notificationApi = {
  list: () => api.get<ApiResponse<unknown[]>>("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

export type { ApiError, ApiResponse, PaginatedResponse };
