"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User, UserRole } from "@/types/user";

/* ─── Mock Users (khớp API Contract — UUID, HTX_* roles, phone login) ─── */
const MOCK_USERS: Record<string, User> = {
  buyer: {
    id: "a1b2c3d4-1111-4aaa-bbbb-000000000001",
    full_name: "Nguyễn Thu Hà",
    email: "ha@mail.com",
    phone: "0901111111",
    avatar_url: undefined,
    role: "BUYER",
    is_banned: false,
    created_at: "2026-01-01T00:00:00Z",
  },
  farmer: {
    id: "a1b2c3d4-2222-4aaa-bbbb-000000000002",
    full_name: "Bác Ba Nhà Vườn",
    email: "bacba@mail.com",
    phone: "0902222222",
    avatar_url: undefined,
    role: "FARMER",
    shop_slug: "vuon-bac-ba",
    is_banned: false,
    created_at: "2026-01-01T00:00:00Z",
  },
  htx_member: {
    id: "a1b2c3d4-3333-4aaa-bbbb-000000000003",
    full_name: "Chú Tư Bến Tre",
    email: "chutu@mail.com",
    phone: "0903333333",
    avatar_url: undefined,
    role: "HTX_MEMBER",
    shop_slug: "vuon-chu-tu",
    htx_id: "htx-001",
    htx_name: "HTX Trái Cây Bến Tre",
    is_banned: false,
    created_at: "2026-01-01T00:00:00Z",
  },
  htx_manager: {
    id: "a1b2c3d4-4444-4aaa-bbbb-000000000004",
    full_name: "Anh Năm Quản Lý",
    email: "anhnam@mail.com",
    phone: "0904444444",
    avatar_url: undefined,
    role: "HTX_MANAGER",
    shop_slug: "vuon-anh-nam",
    htx_id: "htx-001",
    htx_name: "HTX Trái Cây Bến Tre",
    is_banned: false,
    created_at: "2026-01-01T00:00:00Z",
  },
  admin: {
    id: "a1b2c3d4-9999-4aaa-bbbb-000000000099",
    full_name: "Admin System",
    phone: "0909999999",
    role: "ADMIN",
    is_banned: false,
    created_at: "2026-01-01T00:00:00Z",
  },
};

/* ─── Sell / Buy Mode (Baseline §1: client-side, không ảnh hưởng JWT) ─── */
type ViewMode = "BUY" | "SELL";

/* ─── Context Type ─── */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // Role helpers (kế thừa: HTX_MANAGER ⊃ HTX_MEMBER ⊃ FARMER ⊃ BUYER)
  isLoggedIn: boolean;
  isBuyer: boolean;
  isFarmer: boolean;         // true for FARMER, HTX_MEMBER, HTX_MANAGER
  isHtxMember: boolean;      // true for HTX_MEMBER, HTX_MANAGER
  isHtxManager: boolean;
  isAdmin: boolean;
  canAccessDashboard: boolean;
  canManageHtx: boolean;
  // Sell/Buy mode
  viewMode: ViewMode;
  isSellMode: boolean;
  toggleViewMode: () => void;
  // Actions
  login: (phone: string, password: string) => Promise<void>;
  loginAs: (role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("BUY");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("capnong-user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    const mode = localStorage.getItem("capnong-view-mode");
    if (mode === "SELL" || mode === "BUY") setViewMode(mode);
    setIsLoading(false);
  }, []);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem("capnong-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("capnong-user");
    }
  }, [user]);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem("capnong-view-mode", viewMode);
  }, [viewMode]);

  // Role helpers (kế thừa theo Baseline)
  const isLoggedIn = user !== null;
  const isBuyer = user?.role === "BUYER";
  const isFarmer = user?.role === "FARMER" || user?.role === "HTX_MEMBER" || user?.role === "HTX_MANAGER";
  const isHtxMember = user?.role === "HTX_MEMBER" || user?.role === "HTX_MANAGER";
  const isHtxManager = user?.role === "HTX_MANAGER";
  const isAdmin = user?.role === "ADMIN";
  const canAccessDashboard = isFarmer;
  const canManageHtx = isHtxManager;
  const isSellMode = viewMode === "SELL" && isFarmer;

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "BUY" ? "SELL" : "BUY"));
  }, []);

  const login = useCallback(async (_phone: string, _password: string) => {
    // TODO: gọi API thật khi BE sẵn sàng
    setUser(MOCK_USERS.farmer);
  }, []);

  const loginAs = useCallback((role: string) => {
    const mockUser = MOCK_USERS[role];
    if (mockUser) setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setViewMode("BUY");
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      isLoggedIn, isBuyer, isFarmer, isHtxMember, isHtxManager, isAdmin,
      canAccessDashboard, canManageHtx,
      viewMode, isSellMode, toggleViewMode,
      login, loginAs, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ─── */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
