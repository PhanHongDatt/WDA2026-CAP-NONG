"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/user";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles có quyền truy cập. Nếu không truyền = chỉ cần login */
  roles?: UserRole[];
}

/**
 * ProtectedRoute — bọc page cần xác thực
 * - Chưa login → CTA đăng nhập
 * - Login nhưng sai role → "Không có quyền"
 */
export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-dark rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-600 dark:text-foreground-muted mb-6 max-w-md">
          Bạn cần đăng nhập để truy cập trang này.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Đăng nhập
          </Link>
          <Link
            href="/"
            className="border border-gray-200 dark:border-border px-8 py-3 rounded-lg font-medium text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(user!.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
          Không có quyền truy cập
        </h2>
        <p className="text-gray-600 dark:text-foreground-muted mb-6 max-w-md">
          Tài khoản của bạn ({user!.role.replace("_", " ")}) không có quyền truy cập trang này.
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
