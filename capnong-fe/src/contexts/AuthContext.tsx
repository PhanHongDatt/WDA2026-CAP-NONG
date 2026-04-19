"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User } from "@/types/user";
import { authService, userService } from "@/services";

/* ─── Sell / Buy Mode (Baseline §1: client-side, không ảnh hưởng JWT) ─── */
type ViewMode = "BUY" | "SELL";

/* ─── Context Type ─── */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // Role helpers (kế thừa: HTX_MANAGER ⊃ HTX_MEMBER ⊃ FARMER ⊃ BUYER)
  isLoggedIn: boolean;
  isBuyer: boolean;
  isFarmer: boolean;
  isHtxMember: boolean;
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
  register: (data: { full_name: string; phone: string; password: string; role: string; email?: string; username?: string; otp?: string }) => Promise<void>;

  logout: () => void;
  loginError: string | null;
  // Profile refresh
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



/* ─── Provider ─── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("BUY");
  const [loginError, setLoginError] = useState<string | null>(null);

  /**
   * Init: Restore session on mount
   * - Nếu USE_MOCK=true → chỉ restore từ localStorage (không gọi API)
   * - Nếu có token → gọi /users/me để verify + lấy profile mới nhất
   * - Nếu token hết hạn → auto-refresh (do Axios interceptor xử lý)
   * - Nếu fail hoàn toàn → clear session
   */
  useEffect(() => {
    const restoreSession = async () => {
      const token = authService.getToken();
      if (!token) {
        // No token = not logged in. Clear any dirty offline states
        localStorage.removeItem("capnong-user");
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Gọi API thật để verify token + lấy profile mới nhất
        const profile = await userService.getProfile();
        setUser(profile);
      } catch {
        // Token invalid + refresh failed → clear everything silently
        // Không throw → tránh ErrorBoundary bắt → tránh loop
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("capnong-user");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Restore view mode
    const mode = localStorage.getItem("capnong-view-mode");
    if (mode === "SELL" || mode === "BUY") setViewMode(mode);

    // Listen for auth changes from other components (e.g., Google OAuth login)
    const handleAuthChanged = () => {
      const stored = localStorage.getItem("capnong-user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      }
    };
    window.addEventListener("auth-changed", handleAuthChanged);
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, []);

  // Persist user to localStorage
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

  // Role helpers
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

  /* ─── Login — gọi BE thật ─── */
  const login = useCallback(async (phone: string, password: string) => {
    setLoginError(null);
    setIsLoading(true);
    try {
      const result = await authService.login(phone, password);
      setUser(result.user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
      // Axios error message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosMsg = (err as any)?.response?.data?.message;
      setLoginError(axiosMsg || msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ─── Register — gọi BE thật ─── */
  const register = useCallback(async (data: { full_name: string; phone: string; password: string; role: string; email?: string; username?: string; otp?: string }) => {
    setLoginError(null);
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      setUser(result.user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng ký thất bại";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosMsg = (err as any)?.response?.data?.message;
      setLoginError(axiosMsg || msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);



  /* ─── Logout ─── */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setViewMode("BUY");
  }, []);

  /* ─── Refresh profile (sau khi update avatar, etc.) ─── */
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
    } catch {
      // Silently fail — user vẫn dùng data cũ
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading, loginError,
      isLoggedIn, isBuyer, isFarmer, isHtxMember, isHtxManager, isAdmin,
      canAccessDashboard, canManageHtx,
      viewMode, isSellMode, toggleViewMode,
      login, register, logout,
      refreshProfile,
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
