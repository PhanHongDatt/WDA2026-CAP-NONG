import type { Metadata } from "next";
import Link from "next/link";
import { Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Đăng Nhập",
  description: "Đăng nhập vào Cạp Nông để mua bán nông sản sạch trực tiếp từ nhà vườn Việt Nam.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background-light">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
              <Leaf className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Đăng nhập</h1>
            <p className="text-foreground-muted text-sm mt-1">
              Chào mừng bạn quay lại Cạp Nông
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-2">
                Email hoặc Số điện thoại
              </label>
              <input
                id="login-email"
                type="text"
                placeholder="Email hoặc SĐT"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary rounded" />
                <span className="text-foreground-muted">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-primary font-medium hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
            >
              Đăng nhập
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-foreground-muted uppercase tracking-wider">
              hoặc
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <div className="space-y-3">
            <button type="button" className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Đăng nhập bằng Google
            </button>
          </div>

          {/* Register link */}
          <p className="text-center mt-6 text-sm text-foreground-muted">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
