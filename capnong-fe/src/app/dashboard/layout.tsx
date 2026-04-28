"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  Plus,
  Megaphone,
  MessageSquare,
  Menu,
  X,
  Lock,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyShop } from "@/services/api/shop";

/* ─── Sidebar links ─── */
const baseSidebarLinks = [
  { href: "/dashboard/shop", label: "Gian hàng", icon: Store, requiresShop: false },
  { href: "/dashboard", label: "Tổng quan", icon: BarChart3, requiresShop: true },
  { href: "/dashboard/products", label: "Sản phẩm", icon: Package, requiresShop: true },
  { href: "/dashboard/products/new", label: "Đăng sản phẩm", icon: Plus, requiresShop: true },
  { href: "/dashboard/orders", label: "Đơn hàng", icon: ShoppingCart, requiresShop: true },
  { href: "/dashboard/reviews", label: "Đánh giá", icon: MessageSquare, requiresShop: true },
  { href: "/dashboard/products/drafts", label: "Bản nháp", icon: FileText, requiresShop: true },
  { href: "/dashboard/marketing", label: "Marketing AI", icon: Megaphone, requiresShop: true },
];

function getHtxLink(role?: string) {
  if (role === "HTX_MANAGER") {
    return { href: "/cooperative/manage", label: "Quản lý HTX", icon: Building2, requiresShop: false };
  }
  if (role === "HTX_MEMBER") {
    return { href: "/cooperative/me", label: "HTX của tôi", icon: Building2, requiresShop: false };
  }
  // FARMER
  return { href: "/cooperative", label: "Hợp tác xã", icon: Building2, requiresShop: false };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isFarmer, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasShop, setHasShop] = useState<boolean | null>(null); // null = loading
  const [mobileOpen, setMobileOpen] = useState(false);

  // Build sidebar links with dynamic HTX link based on role
  const sidebarLinks = useMemo(() => {
    const htxLink = getHtxLink(user?.role);
    return [...baseSidebarLinks, htxLink];
  }, [user?.role]);

  const checkShop = useCallback(async () => {
    try {
      const shop = await getMyShop();
      setHasShop(!!shop);
    } catch {
      setHasShop(false);
    }
  }, []);

  // Check if farmer has a shop
  useEffect(() => {
    if (isLoading || !user || !isFarmer) return;
    checkShop();
  }, [isLoading, user, isFarmer, checkShop]);

  // Redirect: nếu chưa có shop mà đang ở trang khác dashboard/shop → redirect
  useEffect(() => {
    if (hasShop === false) {
      const allowedPaths = ["/dashboard/shop", "/dashboard/shop/create"];
      if (!allowedPaths.includes(pathname)) {
        router.replace("/dashboard/shop");
      }
    }
  }, [hasShop, pathname, router]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ─── Mobile toggle button ─── */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed bottom-24 right-6 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-light transition-colors"
          aria-label="Mở menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* ─── Mobile overlay ─── */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ─── Sidebar ─── */}
        <aside
          className={`
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            fixed lg:relative
            inset-y-0 left-0 z-50 lg:z-auto
            w-64 lg:w-60 shrink-0
            lg:block
            transition-transform duration-300 ease-in-out
          `}
        >
          <div className="h-full lg:h-auto overflow-y-auto lg:overflow-visible bg-white dark:bg-surface border-r lg:border border-border lg:rounded-2xl p-4 space-y-1 lg:sticky lg:top-24">
            {/* Mobile close */}
            <div className="flex items-center justify-between lg:justify-start gap-2 px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <span className="font-black text-primary text-sm">Gian hàng</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-surface-hover flex items-center justify-center"
                aria-label="Đóng menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              const disabled = link.requiresShop && hasShop === false;

              if (disabled) {
                return (
                  <div
                    key={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-muted/40 cursor-not-allowed select-none"
                    title="Hãy tạo gian hàng trước"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{link.label}</span>
                    <Lock className="w-3 h-3 opacity-40" />
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground-muted hover:text-foreground hover:bg-gray-50 dark:hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Shop status badge */}
            {hasShop === false && (
              <div className="mt-4 mx-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-xl">
                <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium leading-relaxed">
                  ⚠️ Bạn chưa có gian hàng. Hãy{" "}
                  <Link href="/dashboard/shop/create" className="text-primary underline font-bold">
                    tạo gian hàng
                  </Link>{" "}
                  để mở khoá các tính năng.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
