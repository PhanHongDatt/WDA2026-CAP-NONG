export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "BUYER" | "FARMER";
  shopId?: number; // Only for FARMER role
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "BUYER" | "FARMER";
}

export interface AuthResponse {
  token: string;
  user: User;
}
