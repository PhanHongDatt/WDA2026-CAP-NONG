"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  X,
  User,
  Package,
  Store,
  LogOut,
  Users,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import FontSizeToggle from "@/components/ui/FontSizeToggle";
import NotificationBell from "@/components/ui/NotificationBell";

/**
 * Header — Role-based UI
 * Guest: Đăng nhập/Đăng ký
 * Buyer: Avatar dropdown (Đơn hàng, Đăng xuất)
 * Farmer: + "Gian hàng"
 * Coop Member: + badge HTX
 * Coop Manager: + "Quản lý HTX"
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user, isLoggedIn, isFarmer, isHtxMember, isHtxManager, isAdmin, loginAs, logout } = useAuth();

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) {
      router.push(`/catalog?q=${encodeURIComponent(q)}`);
      setSearchQuery("");
    } else {
      router.push("/catalog");
    }
  };

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-primary-dark text-white py-2 px-4" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <span>Hotline:</span>
            <a className="font-bold" href="tel:0901234567">
              0901 234 567
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {/* Spacer if needed or just empty to keep layout balanced */}
            <div className="flex items-center space-x-1 cursor-pointer">
              <span className="uppercase">VN</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1 cursor-pointer">
              <span>Miền Nam</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-surface border-b border-gray-100 dark:border-border py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 lg:gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-black text-primary tracking-tight shrink-0"
          >
            CẠP NÔNG
          </Link>

          {/* Category Toggle → link to catalog */}
          <Link href="/catalog" className="hidden lg:flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-surface-hover shrink-0 transition-colors">
            <Menu className="w-5 h-5" />
            <span className="font-medium text-gray-700 dark:text-foreground">Danh mục</span>
          </Link>

          {/* Search Bar — functional */}
          <div className="flex-grow max-w-2xl relative hidden md:block">
            <input
              aria-label="Tìm kiếm nông sản"
              className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-200 dark:border-border dark:bg-background-light dark:text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-colors"
              placeholder="Tìm kiếm nông sản sạch..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button type="button" aria-label="Tìm kiếm" onClick={handleSearch} className="absolute right-1 top-1 bottom-1 px-5 bg-primary text-white rounded-full hover:opacity-90 transition-all">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0 ml-auto">
            {/* Font Size + Theme toggles */}
            <div className="hidden lg:flex items-center gap-2">
              <FontSizeToggle />
              <ThemeToggle />
            </div>

            {/* Wishlist — only logged in */}
            {isLoggedIn && (
              <Link href="/wishlist" className="relative cursor-pointer hidden md:block" aria-label="Danh sách yêu thích">
                <Heart className="w-6 h-6 text-gray-600 dark:text-foreground-muted hover:text-primary transition-colors" />
              </Link>
            )}

            {/* Notifications — only logged in */}
            <div className="hidden md:block">
              <NotificationBell />
            </div>

            {/* Cart — only buyers & guests */}
            {(!isLoggedIn || user?.role === "BUYER") && (
              <Link href="/cart" className="relative cursor-pointer" aria-label="Giỏ hàng">
                <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-foreground-muted hover:text-primary transition-colors" />
                {/* Badge count sẽ từ cartService */}
              </Link>
            )}

            {/* === AUTH SECTION === */}
            {!isLoggedIn ? (
              /* Guest — Đăng nhập / Đăng ký */
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-foreground-muted font-medium hover:text-primary transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Đăng ký
                </Link>
              </div>
            ) : user ? (
              /* Logged in — Avatar Dropdown */
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                >
                  {/* Avatar circle */}
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-foreground max-w-[120px] truncate">
                    {user.full_name || user.email || "Người dùng"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl shadow-lg py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-border">
                      <p className="font-medium text-gray-900 dark:text-foreground">{user.full_name || user.email || "Người dùng"}</p>
                      <p className="text-sm text-gray-500 dark:text-foreground-muted">{user.phone || user.email || ""}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-dark text-primary">
                        {(user.role || "USER").replace("_", " ")}
                      </span>
                    </div>

                    {/* Buyer links */}
                    {user.role === "BUYER" && (
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-hover text-gray-700 dark:text-foreground transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Package className="w-4 h-4" />
                        <span>Đơn hàng của tôi</span>
                        {/* Badge đơn đang giao */}
                        <span className="ml-auto text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">2</span>
                      </Link>
                    )}

                    {/* Farmer links */}
                    {isFarmer && (
                      <>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-hover text-gray-700 dark:text-foreground transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Store className="w-4 h-4" />
                          <span>Gian hàng của tôi</span>
                        </Link>
                        <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-hover text-gray-700 dark:text-foreground transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Package className="w-4 h-4" />
                          <span>Quản lý đơn hàng</span>
                        </Link>
                      </>
                    )}

                    {/* HTX Member badge */}
                    {isHtxMember && user.htx_name && (
                      <Link href="/cooperative" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-hover text-gray-700 dark:text-foreground transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Users className="w-4 h-4 text-primary" />
                        <span className="truncate">{user.htx_name}</span>
                      </Link>
                    )}

                    {/* HTX Manager link */}
                    {isHtxManager && (
                      <Link href="/cooperative/manage" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-hover text-primary font-medium transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Shield className="w-4 h-4" />
                        <span>Quản lý HTX</span>
                      </Link>
                    )}

                    {/* Admin link */}
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-hover text-red-500 font-medium transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Shield className="w-4 h-4" />
                        <span>Quản trị hệ thống</span>
                      </Link>
                    )}

                    {/* Account */}
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-hover text-gray-700 dark:text-foreground transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <User className="w-4 h-4" />
                      <span>Tài khoản</span>
                    </Link>

                    {/* Logout */}
                    <div className="border-t border-gray-100 dark:border-border mt-1 pt-1">
                      <button type="button"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-hover text-red-500 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Mobile menu toggle */}
            <button type="button"
              className="md:hidden p-2"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 dark:text-foreground" />
              ) : (
                <Menu className="w-6 h-6 dark:text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-border px-4 py-4 space-y-4 bg-white dark:bg-surface transition-colors">
            {/* Mobile Search */}
            <div className="relative">
              <input
                aria-label="Tìm kiếm nông sản"
                className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-200 dark:border-border dark:bg-background-light dark:text-foreground focus:ring-2 focus:ring-primary text-sm outline-none"
                placeholder="Tìm kiếm nông sản sạch..."
                type="text"
              />
              <button type="button" aria-label="Tìm kiếm" className="absolute right-1 top-1 bottom-1 px-4 bg-primary text-white rounded-full">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Theme + Font controls */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-border">
              <span className="text-sm text-gray-600 dark:text-foreground-muted">Giao diện</span>
              <div className="flex items-center gap-2">
                <FontSizeToggle />
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Auth / Nav Links */}
            <div className="flex flex-col gap-3">
              {!isLoggedIn ? (
                <>
                  <Link href="/login" className="text-gray-600 dark:text-foreground-muted font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary text-white px-6 py-2 rounded-lg font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              ) : (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-border">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium dark:text-foreground">{user?.full_name || user?.email || "Người dùng"}</p>
                      <p className="text-xs text-gray-500 dark:text-foreground-muted uppercase">{(user?.role || "USER").replace("_", " ")}</p>
                    </div>
                  </div>

                  {isFarmer && (
                    <Link href="/dashboard" className="text-gray-700 dark:text-foreground font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                      🏪 Gian hàng của tôi
                    </Link>
                  )}
                  {isHtxMember && user?.htx_name && (
                    <Link href="/cooperative" className="text-gray-700 dark:text-foreground font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                      🤝 {user?.htx_name}
                    </Link>
                  )}
                  {isHtxManager && (
                    <Link href="/cooperative/manage" className="text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                      🛡️ Quản lý HTX
                    </Link>
                  )}
                  <button type="button"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-left text-red-500 font-medium"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
