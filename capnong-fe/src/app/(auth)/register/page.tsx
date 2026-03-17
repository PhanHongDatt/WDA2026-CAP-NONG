"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, User, Tractor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [role, setRole] = useState<"BUYER" | "FARMER">("BUYER");

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
            <button
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
            <button
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
              <label className="block text-sm font-medium mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                placeholder="0901 234 567"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Mật khẩu *
              </label>
              <input
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>

            {/* Farmer-specific field */}
            {role === "FARMER" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên nông trại / HTX
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nông trại Xanh Đà Lạt"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
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
              type="submit"
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
