"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Store, X, Sparkles, ArrowRight, Mic, ShieldCheck, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyShop } from "@/services/api/shop";

const DISMISS_KEY = "capnong-shop-prompt-dismissed";

/**
 * CreateShopPrompt — Popup gợi ý tạo gian hàng cho FARMER chưa có shop.
 *
 * Hiển thị khi:
 *  - User đã đăng nhập.
 *  - Role là FARMER / HTX_MEMBER / HTX_MANAGER.
 *  - Chưa có gian hàng (getMyShop() = null).
 *  - Chưa dismiss trong phiên này (sessionStorage).
 *  - Không đang ở trang /dashboard/shop/create (tránh loop).
 */
export default function CreateShopPrompt() {
  const { user, isFarmer, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkShop = useCallback(async () => {
    // Nếu đã dismiss trong phiên này, không hiện nữa
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    // Không check trên trang tạo shop
    if (pathname === "/dashboard/shop/create") return;

    setChecking(true);
    try {
      const shop = await getMyShop();
      if (!shop) {
        setShow(true);
      }
    } catch {
      // Nếu lỗi 401 hoặc network → không hiện popup
    } finally {
      setChecking(false);
    }
  }, [pathname]);

  useEffect(() => {
    // Chỉ check khi:
    // 1. Đã load xong auth
    // 2. Đã đăng nhập
    // 3. Có role farmer+
    if (isLoading || !user || !isFarmer) return;
    checkShop();
  }, [isLoading, user, isFarmer, checkShop]);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  const handleCreate = () => {
    setShow(false);
    router.push("/dashboard/shop/create");
  };

  if (!show || checking) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] animate-fadeIn"
        onClick={handleDismiss}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 animate-scaleIn">
        <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-border">
          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-primary to-primary-dark p-6 pb-10 text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-lg" />

            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                <Store className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black leading-tight">
                Chào mừng nhà vườn! 🌱
              </h2>
              <p className="text-white/85 text-sm mt-2 leading-relaxed">
                Tạo gian hàng để bắt đầu bán nông sản và tiếp cận hàng ngàn người mua trên Cạp Nông.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mic className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Đăng bán bằng giọng nói</p>
                  <p className="text-xs text-foreground-muted">AI tự động tạo mô tả sản phẩm cho bạn</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-800/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Truy xuất nguồn gốc</p>
                  <p className="text-xs text-foreground-muted">Tạo niềm tin với người mua qua chứng nhận</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Nhận đơn tức thời</p>
                  <p className="text-xs text-foreground-muted">Thông báo đơn hàng mới qua Telegram</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleCreate}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl font-bold hover:bg-primary-light transition-all shadow-md shadow-primary/20 text-sm group"
              >
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                Tạo gian hàng ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={handleDismiss}
                className="w-full text-sm text-foreground-muted hover:text-foreground py-2.5 rounded-xl transition-colors font-medium"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
