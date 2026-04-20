import type { Metadata } from "next";
import Link from "next/link";
import { Store, Package, ShoppingCart, BarChart3, FileText, Plus, Megaphone, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Quản lý gian hàng",
    template: "%s — Gian hàng | Cạp Nông",
  },
  description: "Quản lý gian hàng, sản phẩm, đơn hàng và doanh thu trên Cạp Nông.",
};

const sidebarLinks = [
  { href: "/dashboard/shop", label: "Gian hàng", icon: Store },
  { href: "/dashboard", label: "Tổng quan", icon: BarChart3 },
  { href: "/dashboard/products", label: "Sản phẩm", icon: Package },
  { href: "/dashboard/products/new", label: "Đăng sản phẩm", icon: Plus },
  { href: "/dashboard/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/dashboard/reviews", label: "Đánh giá", icon: MessageSquare },
  { href: "/dashboard/products/drafts", label: "Bản nháp", icon: FileText },
  { href: "/dashboard/marketing", label: "Marketing AI", icon: Megaphone },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar — hidden on mobile */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-24 bg-white dark:bg-surface border border-border rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <Store className="w-5 h-5 text-primary" />
              <span className="font-black text-primary text-sm">Gian hàng</span>
            </div>
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
