"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  X,
} from "lucide-react";

/**
 * Header — matching home.html lines 38-117 exactly
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Utility Bar — home.html line 39: bg-[#1B5E20] */}
      <div className="bg-primary-dark text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <span>Hotline:</span>
            <a className="font-bold" href="tel:0901234567">
              0901 234 567
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a className="hover:underline" href="#">
              Góc chia sẻ
            </a>
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

      {/* Main Header — home.html line 64: sticky top-0 z-50 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-black text-primary tracking-tight shrink-0"
          >
            CẠP NÔNG
          </Link>

          {/* Category Toggle */}
          <button className="hidden lg:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 shrink-0">
            <Menu className="w-5 h-5" />
            <span className="font-medium text-gray-700">Danh mục</span>
          </button>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl relative hidden md:block">
            <input
              className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              placeholder="Tìm kiếm nông sản sạch..."
              type="text"
            />
            <button className="absolute right-1 top-1 bottom-1 px-5 bg-primary text-white rounded-full hover:opacity-90 transition-all">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 shrink-0 ml-auto">
            <div className="relative cursor-pointer hidden md:block">
              <Heart className="w-6 h-6 text-gray-600 hover:text-primary" />
            </div>
            <Link href="/cart" className="relative cursor-pointer">
              <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-primary" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                2
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 font-medium hover:text-primary"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
              >
                Đăng ký
              </Link>
            </div>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-4 bg-white">
            <div className="relative">
              <input
                className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-200 focus:ring-2 focus:ring-primary text-sm outline-none"
                placeholder="Tìm kiếm nông sản sạch..."
                type="text"
              />
              <button className="absolute right-1 top-1 bottom-1 px-4 bg-primary text-white rounded-full">
                <Search className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-gray-600 font-medium hover:text-primary">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium text-center"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
