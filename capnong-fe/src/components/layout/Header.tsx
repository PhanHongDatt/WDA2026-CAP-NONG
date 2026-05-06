"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Heart,
  ShoppingCart,
  X,
  User,
  Package,
  Store,
  LogOut,
  Users,
  Shield,
  ArrowLeftRight,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import FontSizeToggle from "@/components/ui/FontSizeToggle";
import NotificationBell from "@/components/ui/NotificationBell";
import { cartService } from "@/services";
import ShopSelectModal from "@/components/shop/ShopSelectModal";
import type { Shop } from "@/types/shop";

/**
 * Header torn-paper bottom edge.
 * We use CSS mask-image and backdrop-filter in globals.css to achieve seamless glassmorphism.
 */
function HeaderTornEdge() {
  return <div className="header-torn-edge" aria-hidden="true" />;
}

/** Navigation items for center menu */
const NAV_ITEMS = [
  { label: "Trang chủ", href: "/home" },
  { label: "Sản phẩm", href: "/catalog" },
  { label: "Nhà vườn", href: "/shops" },
];

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
  const pathname = usePathname();

  const { user, isLoggedIn, isFarmer, isHtxMember, isHtxManager, isAdmin, isSellMode, toggleViewMode, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const [shopSelectModalOpen, setShopSelectModalOpen] = useState(false);
  const [myShops, setMyShops] = useState<Shop[]>([]);

  const handleShopClick = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    if (!isHtxManager) {
      router.push("/dashboard");
      return;
    }
    try {
      const { getAllMyShops } = await import("@/services/api/shop");
      const shops = await getAllMyShops();
      if (shops.length > 1) {
        setMyShops(shops);
        setShopSelectModalOpen(true);
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (user && user.role === "BUYER") {
      import("@/services/api/order").then(({ apiOrderService }) => {
        apiOrderService.getMyOrders({ page: 0, size: 1, sort: "createdAt,desc" })
          .then((res: any) => {
            setOrderCount(res.totalElements || 0);
          })
          .catch(() => {});
      });
    }
  }, [user]);

  useEffect(() => {
    cartService.getItemCount().then(setCartCount).catch(() => {});
    const handleCartUpdated = () => cartService.getItemCount().then(setCartCount).catch(() => {});
    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => window.removeEventListener("cartUpdated", handleCartUpdated);
  }, []);

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
      {/* Main Header */}
      <header className="site-header" id="site-header">
        <div className="header-inner">
          {/* ═══ LEFT: Logo + Mascot ═══ */}
          <Link href="/" className="header-logo">
            <img
              src="/images/logo.png"
              alt="Cạp Nông Logo"
              className="header-logo-img"
            />
            <div className="header-logo-text">
              <span className="header-brand-name">Cạp Nông</span>
              <span className="header-brand-tagline">Ăn sạch · Sống xanh</span>
            </div>
          </Link>

          {/* ═══ CENTER: Navigation Menu ═══ */}
          <nav className="header-nav" aria-label="Điều hướng chính">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`header-nav-link ${isActive ? "header-nav-link--active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ═══ RIGHT: Search + Actions ═══ */}
          <div className="header-actions">
            {/* Search Bar */}
            <div className="header-search">
              <Search className="header-search-icon" aria-hidden="true" />
              <input
                aria-label="Tìm kiếm nông sản"
                className="header-search-input"
                placeholder="Tìm nông sản, nhà vườn..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Sell / Buy Mode Toggle (FARMER+ only) */}
            {isLoggedIn && isFarmer && (
              <button
                type="button"
                onClick={toggleViewMode}
                className={`header-mode-toggle ${isSellMode ? "header-mode-toggle--sell" : "header-mode-toggle--buy"}`}
                title={isSellMode ? "Đang ở chế độ Bán — nhấn để chuyển sang Mua" : "Đang ở chế độ Mua — nhấn để chuyển sang Bán"}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {isSellMode ? "Bán" : "Mua"}
              </button>
            )}

            {/* Font size — hidden on small screens */}
            
            <div className="header-icon-btn">
              <FontSizeToggle />
            </div>

            {/* Theme Toggle — hidden on small screens */}
            <div className="header-icon-btn">
              <ThemeToggle />
            </div>

            {/* Wishlist — only logged in */}
            {isLoggedIn && (
              <Link href="/wishlist" className="header-icon-btn" aria-label="Danh sách yêu thích" title="Yêu thích">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Notifications — only logged in */}
            <div className="header-notification-wrapper">
              <NotificationBell />
            </div>

            {/* Order lookup */}
            <Link
              href="/orders/lookup"
              className="header-icon-btn"
              aria-label="Tra cứu đơn hàng"
              title="Tra cứu đơn"
            >
              <Package className="w-5 h-5" />
            </Link>

            {/* Cart */}
            {(!isLoggedIn || (user?.role === "BUYER") || (isFarmer && !isSellMode)) && (
              <Link href="/cart" className="header-icon-btn header-cart-btn" aria-label="Giỏ hàng" title="Giỏ hàng">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="header-cart-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* === AUTH SECTION === */}
            {!isLoggedIn ? (
              /* Guest — Đăng nhập */
              <Link
                href="/login"
                className="header-login-btn"
              >
                <User className="w-4 h-4" />
                <span className="header-login-text">Đăng nhập</span>
              </Link>
            ) : user ? (
              /* Logged in — Avatar Dropdown */
              <div className="header-user-menu" ref={userMenuRef}>
                <button type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="header-avatar-btn"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="header-avatar-img" />
                  ) : (
                    <div className="header-avatar-placeholder">
                      {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="header-dropdown">
                    {/* User info */}
                    <div className="header-dropdown-info">
                      <p className="header-dropdown-name">{user.full_name || user.email || "Người dùng"}</p>
                      <p className="header-dropdown-sub">{user.phone || user.email || ""}</p>
                      <span className="header-dropdown-role">
                        {(user.role || "USER").replace("_", " ")}
                      </span>
                    </div>

                    {/* Buyer links */}
                    {user.role === "BUYER" && (
                      <Link href="/orders" className="header-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <Package className="w-4 h-4" />
                        <span>Đơn hàng của tôi</span>
                        {orderCount > 0 && (
                          <span className="header-dropdown-badge">
                            {orderCount > 99 ? "99+" : orderCount}
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Farmer links */}
                    {isFarmer && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); handleShopClick(); }}
                          className="header-dropdown-item"
                        >
                          <Store className="w-4 h-4" />
                          <span>Gian hàng của tôi</span>
                        </button>
                        <Link href="/dashboard/orders" className="header-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                          <Package className="w-4 h-4" />
                          <span>Quản lý đơn hàng</span>
                        </Link>
                      </>
                    )}

                    {/* HTX Member badge */}
                    {isHtxMember && user.htx_name && (
                      <Link href="/cooperative" className="header-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <Users className="w-4 h-4 text-primary" />
                        <span className="truncate">{user.htx_name}</span>
                      </Link>
                    )}

                    {/* HTX Manager link */}
                    {isHtxManager && (
                      <Link href="/cooperative/manage" className="header-dropdown-item header-dropdown-item--primary" onClick={() => setUserMenuOpen(false)}>
                        <Shield className="w-4 h-4" />
                        <span>Quản lý HTX</span>
                      </Link>
                    )}

                    {/* Admin link */}
                    {isAdmin && (
                      <Link href="/admin" className="header-dropdown-item header-dropdown-item--danger" onClick={() => setUserMenuOpen(false)}>
                        <Shield className="w-4 h-4" />
                        <span>Quản trị hệ thống</span>
                      </Link>
                    )}

                    {/* Account */}
                    <Link href="/profile" className="header-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User className="w-4 h-4" />
                      <span>Tài khoản</span>
                    </Link>

                    {/* Logout */}
                    <div className="header-dropdown-divider">
                      <button type="button"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="header-dropdown-item header-dropdown-item--danger"
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
              className="header-mobile-toggle"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Torn paper bottom edge */}
        <HeaderTornEdge />

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="header-mobile-menu">
            {/* Mobile Nav Links */}
            <nav className="header-mobile-nav">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="header-mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Search */}
            <div className="header-mobile-search">
              <input
                aria-label="Tìm kiếm nông sản"
                className="header-mobile-search-input"
                placeholder="Tìm kiếm nông sản sạch..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button type="button" aria-label="Tìm kiếm" onClick={handleSearch} className="header-mobile-search-btn">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Theme + Font controls */}
            <div className="header-mobile-controls">
              <span className="text-sm text-gray-600 dark:text-foreground-muted">Giao diện</span>
              <div className="flex items-center gap-2">
                <FontSizeToggle />
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Auth / Nav Links */}
            <div className="header-mobile-auth">
              {!isLoggedIn ? (
                <>
                  <Link href="/orders/lookup" className="header-mobile-link header-mobile-link--primary" onClick={() => setMobileMenuOpen(false)}>
                    <Package className="w-5 h-5" /> Tra cứu đơn hàng
                  </Link>
                  <Link href="/login" className="header-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="header-mobile-register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              ) : (
                <>
                  {/* User info */}
                  <div className="header-mobile-user-info">
                    <div className="header-mobile-user-avatar">
                      {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium dark:text-foreground">{user?.full_name || user?.email || "Người dùng"}</p>
                      <p className="text-xs text-gray-500 dark:text-foreground-muted uppercase">{(user?.role || "USER").replace("_", " ")}</p>
                    </div>
                  </div>

                  {user?.role === "BUYER" && (
                    <Link href="/orders" className="header-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                      <Package className="w-5 h-5" /> Đơn hàng của tôi
                    </Link>
                  )}

                  {isFarmer && (
                    <>
                      {/* Mobile Sell/Buy Toggle */}
                      <button
                        type="button"
                        onClick={() => { toggleViewMode(); setMobileMenuOpen(false); }}
                        className={`header-mobile-mode-toggle ${isSellMode ? "header-mobile-mode-toggle--sell" : "header-mobile-mode-toggle--buy"}`}
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        {isSellMode ? "Đang ở chế độ Bán → chuyển sang Mua" : "Đang ở chế độ Mua → chuyển sang Bán"}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleShopClick(); }}
                        className="header-mobile-link"
                      >
                        <Store className="w-5 h-5" /> Gian hàng của tôi
                      </button>
                      <Link href="/dashboard/orders" className="header-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                        <Package className="w-5 h-5" /> Quản lý đơn hàng
                      </Link>
                    </>
                  )}
                  {isHtxMember && user?.htx_name && (
                    <Link href="/cooperative" className="header-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                      <Users className="w-5 h-5 text-primary" /> {user?.htx_name}
                    </Link>
                  )}
                  {isHtxManager && (
                    <Link href="/cooperative/manage" className="header-mobile-link header-mobile-link--primary" onClick={() => setMobileMenuOpen(false)}>
                      <Shield className="w-5 h-5" /> Quản lý HTX
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="header-mobile-link header-mobile-link--danger" onClick={() => setMobileMenuOpen(false)}>
                      <Shield className="w-5 h-5" /> Quản trị hệ thống
                    </Link>
                  )}
                  <Link href="/profile" className="header-mobile-link header-mobile-link--border-top" onClick={() => setMobileMenuOpen(false)}>
                    <User className="w-5 h-5" /> Tài khoản
                  </Link>
                  <button type="button"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="header-mobile-link header-mobile-link--danger"
                  >
                    <LogOut className="w-5 h-5" /> Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <ShopSelectModal 
        isOpen={shopSelectModalOpen} 
        onClose={() => setShopSelectModalOpen(false)} 
        shops={myShops} 
      />
    </>
  );
}
