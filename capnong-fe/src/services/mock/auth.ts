/**
 * Mock Auth Service — dùng khi NEXT_PUBLIC_USE_MOCK_DATA=true
 */
import type { IAuthService, AuthResult } from "../types";
import type { User } from "@/types/user";

const MOCK_USERS: Record<string, User> = {
  buyer: {
    id: "a1b2c3d4-1111-4aaa-bbbb-000000000001",
    full_name: "Nguyễn Thu Hà", email: "ha@mail.com", phone: "0901111111",
    role: "BUYER", is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  farmer: {
    id: "a1b2c3d4-2222-4aaa-bbbb-000000000002",
    full_name: "Bác Ba Nhà Vườn", email: "bacba@mail.com", phone: "0902222222",
    role: "FARMER", shop_slug: "vuon-bac-ba", is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  htx_member: {
    id: "a1b2c3d4-3333-4aaa-bbbb-000000000003",
    full_name: "Chú Tư Bến Tre", email: "chutu@mail.com", phone: "0903333333",
    role: "HTX_MEMBER", shop_slug: "vuon-chu-tu", htx_id: "htx-001", htx_name: "HTX Trái Cây Bến Tre",
    is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  htx_manager: {
    id: "a1b2c3d4-4444-4aaa-bbbb-000000000004",
    full_name: "Anh Năm Quản Lý", email: "anhnam@mail.com", phone: "0904444444",
    role: "HTX_MANAGER", shop_slug: "vuon-anh-nam", htx_id: "htx-001", htx_name: "HTX Trái Cây Bến Tre",
    is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  admin: {
    id: "a1b2c3d4-9999-4aaa-bbbb-000000000099",
    full_name: "Admin System", phone: "0909999999",
    role: "ADMIN", is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
};

// Map phone → mock user
const PHONE_MAP: Record<string, string> = {
  "0901111111": "buyer",
  "0902222222": "farmer",
  "0903333333": "htx_member",
  "0904444444": "htx_manager",
  "0909999999": "admin",
};

export const mockAuthService: IAuthService = {
  async login(phone: string, _password: string): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 300)); // simulate delay
    const key = PHONE_MAP[phone] || "farmer";
    const user = MOCK_USERS[key];
    const token = "mock-jwt-token-" + user.role.toLowerCase();
    localStorage.setItem("access_token", token);
    return { access_token: token, user };
  },

  async register(data): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 300));
    const user: User = {
      id: crypto.randomUUID(),
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      role: data.role as User["role"],
      is_banned: false,
      created_at: new Date().toISOString(),
    };
    const token = "mock-jwt-token-" + data.role.toLowerCase();
    localStorage.setItem("access_token", token);
    return { access_token: token, user };
  },

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("capnong-user");
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },
};
