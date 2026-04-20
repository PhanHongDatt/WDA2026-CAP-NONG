import Link from "next/link";
import type { Metadata } from "next";
import { ShieldX, Home, LogIn } from "lucide-react";

export const metadata: Metadata = {
  title: "403 — Không có quyền truy cập",
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10 text-accent" />
      </div>
      <h1 className="text-6xl font-black text-accent mb-2">403</h1>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Không có quyền truy cập
      </h2>
      <p className="text-foreground-muted max-w-md mb-8">
        Bạn không có quyền truy cập trang này. Vui lòng kiểm tra lại tài khoản
        hoặc liên hệ quản trị viên.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20"
        >
          <Home className="w-5 h-5" />
          Về trang chủ
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors"
        >
          <LogIn className="w-5 h-5" />
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
