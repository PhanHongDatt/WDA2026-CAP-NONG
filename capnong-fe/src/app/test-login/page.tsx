"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * DEV-ONLY: Test helper page for switching roles via URL.
 * Usage: /test-login?role=buyer|farmer|htx_member|htx_manager|admin
 * After setting localStorage, redirects to appropriate page.
 */
const QUICK_USERS: Record<string, object | null> = {
  buyer: {
    id: "a1b2c3d4-1111-4aaa-bbbb-000000000001",
    full_name: "Nguyễn Thu Hà", phone: "0901111111", role: "BUYER",
    is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  farmer: {
    id: "a1b2c3d4-2222-4aaa-bbbb-000000000002",
    full_name: "Bác Ba Nhà Vườn", phone: "0902222222", role: "FARMER",
    shop_slug: "vuon-bac-ba", is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  htx_member: {
    id: "a1b2c3d4-3333-4aaa-bbbb-000000000003",
    full_name: "Chú Tư Bến Tre", phone: "0903333333", role: "HTX_MEMBER",
    shop_slug: "vuon-chu-tu", htx_id: "htx-001", htx_name: "HTX Trái Cây Bến Tre",
    is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  htx_manager: {
    id: "a1b2c3d4-4444-4aaa-bbbb-000000000004",
    full_name: "Anh Năm Quản Lý", phone: "0904444444", role: "HTX_MANAGER",
    shop_slug: "vuon-anh-nam", htx_id: "htx-001", htx_name: "HTX Trái Cây Bến Tre",
    is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  admin: {
    id: "a1b2c3d4-9999-4aaa-bbbb-000000000099",
    full_name: "Admin System", phone: "0909999999", role: "ADMIN",
    is_banned: false, created_at: "2026-01-01T00:00:00Z",
  },
  guest: null,
};

const REDIRECTS: Record<string, string> = {
  buyer: "/home",
  farmer: "/dashboard",
  htx_member: "/cooperative",
  htx_manager: "/cooperative/manage",
  admin: "/admin",
  guest: "/home",
};

function TestLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") || "guest";
  const redirect = params.get("redirect");

  useEffect(() => {
    const userData = QUICK_USERS[role];
    if (userData) {
      localStorage.setItem("capnong-user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("capnong-user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    // Navigate to target or role default
    const target = redirect || REDIRECTS[role] || "/home";
    window.location.href = target;
  }, [role, redirect, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-lg font-bold">Đang chuyển vai trò: {role.toUpperCase()}</p>
      </div>
    </div>
  );
}

export default function TestLoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <TestLoginInner />
    </Suspense>
  );
}
