"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, User, Tractor, Package, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [role, setRole] = useState<"BUYER" | "FARMER">("BUYER");
  const [registered, setRegistered] = useState(false);
  const [phone, setPhone] = useState("");

  /* UC-22: Simulated merge guest orders */
  const hasMergedOrders = phone.startsWith("09");

  if (registered) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-background-light">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground">Đăng ký thành công!</h2>
          <p className="text-foreground-muted">
            Chào mừng bạn đến Cạp Nông 🌿
          </p>

          {/* UC-22: Merge guest banner */}
          {hasMergedOrders && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    Đã liên kết 2 đơn hàng cũ!
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Chúng tôi đã tìm thấy đơn hàng từ SĐT {phone} khi bạn mua với tư cách khách. Các đơn đã được liên kết vào tài khoản mới.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
              Khám phá ngay
            </Link>
            <Link href="/login" className="border border-gray-200 dark:border-border px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-background-light">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
              <Leaf className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground">
              Tạo tài khoản
            </h1>
            <p className="text-foreground-muted text-sm mt-1">
              Tham gia cộng đồng nông sản sạch Cạp Nông
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button"
              onClick={() => setRole("BUYER")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors",
                role === "BUYER"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-gray-300"
              )}
            >
              <User
                className={cn(
                  "w-6 h-6",
                  role === "BUYER" ? "text-primary" : "text-foreground-muted"
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  role === "BUYER" ? "text-primary" : "text-foreground-muted"
                )}
              >
                Người mua
              </span>
            </button>
            <button type="button"
              onClick={() => setRole("FARMER")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors",
                role === "FARMER"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-gray-300"
              )}
            >
              <Tractor
                className={cn(
                  "w-6 h-6",
                  role === "FARMER" ? "text-primary" : "text-foreground-muted"
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  role === "FARMER" ? "text-primary" : "text-foreground-muted"
                )}
              >
                Nông dân
              </span>
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium mb-2">
                Họ và tên *
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium mb-2">Email *</label>
              <input
                id="register-email"
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium mb-2">
                Số điện thoại *
              </label>
              <input
                id="register-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium mb-2">
                Mật khẩu *
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>

            {/* Farmer-specific field */}
            {role === "FARMER" && (
              <div>
                <label htmlFor="register-farm" className="block text-sm font-medium mb-2">
                  Tên nông trại / HTX
                </label>
                <input
                  id="register-farm"
                  type="text"
                  placeholder="Ví dụ: Nông trại Xanh Đà Lạt"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                aria-label="Đồng ý điều khoản sử dụng"
                className="accent-primary mt-1 rounded"
              />
              <span className="text-xs text-foreground-muted">
                Tôi đồng ý với{" "}
                <a href="#" className="text-primary hover:underline">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-primary hover:underline">
                  Chính sách bảo mật
                </a>{" "}
                của Cạp Nông
              </span>
            </div>

            <button
              type="button"
              onClick={() => setRegistered(true)}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
            >
              Đăng ký
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-foreground-muted">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
