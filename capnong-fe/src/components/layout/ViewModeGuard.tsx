"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * ViewModeGuard — Client-side route guard for Sell/Buy mode.
 *
 * SELL Mode (farmer muốn bán hàng):
 *   - Nếu đang ở /home → redirect → /dashboard
 *   - Ẩn giỏ hàng (do Header xử lý)
 *
 * BUY Mode (farmer muốn mua hàng):
 *   - Nếu đang ở /dashboard/* → redirect → /home
 *   - Hiện giỏ hàng, catalog bình thường
 *
 * Chỉ áp dụng cho FARMER/HTX_MEMBER/HTX_MANAGER.
 * BUYER và Guest không bị ảnh hưởng.
 */
export default function ViewModeGuard() {
  const { user, isFarmer, isSellMode, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user || !isFarmer) return;

    if (isSellMode) {
      // Sell mode: block /home → redirect to dashboard
      if (pathname === "/home") {
        router.replace("/dashboard");
      }
    } else {
      // Buy mode: block /dashboard/* → redirect to home
      // Exception: allow /dashboard/shop (để farmer xem/tạo shop) and /dashboard/shop/create
      if (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/shop")) {
        router.replace("/home");
      }
    }
  }, [isLoading, user, isFarmer, isSellMode, pathname, router]);

  return null;
}
