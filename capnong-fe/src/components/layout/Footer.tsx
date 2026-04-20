"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Footer — updated with real links, logo, and social media "coming soon" modal
 */
export default function Footer() {
  const [showModal, setShowModal] = useState(false);
  const [socialName, setSocialName] = useState("");

  const handleSocialClick = (name: string) => {
    setSocialName(name);
    setShowModal(true);
  };

  return (
    <>
      <footer className="bg-gray-50 dark:bg-surface border-t border-gray-200 dark:border-border pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Grid 4 cols */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/images/logo.png"
                  alt="Cạp Nông Logo"
                  className="w-12 h-12 object-contain"
                />
                <h4 className="font-black text-primary text-xl">CẠP NÔNG</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-foreground-muted leading-relaxed">
                Kết nối trực tiếp nông sản từ vườn đến bàn ăn. Đảm bảo chất
                lượng, minh bạch nguồn gốc và giá cả hợp lý nhất.
              </p>
            </div>

            {/* About */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Về Cạp Nông</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
                <li><Link className="hover:text-primary transition-colors" href="/home">Trang chủ</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/catalog">Sản phẩm</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/cooperative">Hợp tác xã số</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/shops">Gian hàng</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Hỗ trợ khách hàng</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
                <li><Link className="hover:text-primary transition-colors" href="/orders/lookup">Tra cứu đơn hàng</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/profile">Tài khoản của tôi</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/register">Đăng ký tài khoản</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/login">Đăng nhập</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Dành cho nông dân</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
                <li><Link className="hover:text-primary transition-colors" href="/dashboard">Quản lý gian hàng</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/dashboard/products/new">Đăng sản phẩm</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/shops/new">Tạo gian hàng</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/cooperative/create">Thành lập HTX</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 dark:border-border pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-foreground-muted gap-4">
            <p>© 2026 Cạp Nông. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleSocialClick("Facebook")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick("Zalo")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Zalo
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick("TikTok")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                TikTok
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-border p-8 max-w-sm w-full mx-4 text-center animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo */}
            <img
              src="/images/logo.png"
              alt="Cạp Nông Logo"
              className="w-20 h-20 object-contain mx-auto mb-4"
            />

            {/* Title */}
            <h3 className="text-xl font-black text-gray-900 dark:text-foreground mb-2">
              🚧 Tính năng đang phát triển
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-foreground-muted mb-6 leading-relaxed">
              Kết nối qua <span className="font-bold text-primary">{socialName}</span> sẽ sớm được
              ra mắt. Cạp Nông đang nỗ lực hoàn thiện để phục vụ bạn tốt hơn!
            </p>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-primary text-white font-bold px-8 py-2.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
