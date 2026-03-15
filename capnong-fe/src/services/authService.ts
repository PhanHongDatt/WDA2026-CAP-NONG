import api from './api';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
    const authData = response.data.data!;
    localStorage.setItem('token', authData.token);
    return authData;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    const authData = response.data.data!;
    localStorage.setItem('token', authData.token);
    return authData;
  },

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
