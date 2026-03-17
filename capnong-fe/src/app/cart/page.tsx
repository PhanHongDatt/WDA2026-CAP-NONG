"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MOCK_SEASONAL_PRODUCTS } from "@/lib/mock-data";

// Mock cart from first 2 products
const INITIAL_CART = [
  { ...MOCK_SEASONAL_PRODUCTS[0], quantity: 2 },
  { ...MOCK_SEASONAL_PRODUCTS[3], quantity: 1 },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(INITIAL_CART);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 300000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
        <p className="text-foreground-muted mb-6">
          Bạn chưa thêm sản phẩm nào vào giỏ hàng.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors"
        >
          Khám phá nông sản
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">
          Giỏ hàng ({cartItems.length})
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-border rounded-xl p-4 flex gap-4 shadow-sm"
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-bold text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-foreground-muted">
                      Nhà vườn: {item.shopName}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-foreground-muted hover:text-accent rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-primary text-lg">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Tạm tính</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Phí giao hàng</span>
                <span className={`font-medium ${shippingFee === 0 ? "text-success" : ""}`}>
                  {shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-foreground-muted bg-primary-50 px-3 py-2 rounded-lg">
                  💡 Mua thêm{" "}
                  <span className="font-bold text-primary">
                    {formatCurrency(300000 - subtotal)}
                  </span>{" "}
                  để được miễn phí giao hàng
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-base">Tổng cộng</span>
                <span className="font-bold text-xl text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block text-center bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
            >
              Tiến hành thanh toán
            </Link>
            <Link
              href="/catalog"
              className="mt-3 block text-center text-primary font-medium text-sm hover:underline"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
