"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ShoppingBag, ChevronRight, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cartService } from "@/services";

export default function CartPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const items = await cartService.getCart();
        setCartItems(items);
        /* Mặc định chọn hết */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSelectedIds(new Set(items.map((i: any) => i.id)));
      } catch {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getItemId = (item: any) => item.id;

  /* Checkbox logic */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cartItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map(getItemId)));
    }
  };

  const allSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

  const updateQuantity = async (id: string, delta: number) => {
    const item = cartItems.find((i) => getItemId(i) === id);
    if (!item) return;
    const oldQty = item.quantity || 1;
    const newQty = Math.max(1, oldQty + delta);
    
    // Optimistic Update
    setCartItems((items) =>
      items.map((i) => getItemId(i) === id ? { ...i, quantity: newQty } : i)
    );
    
    try { 
      await cartService.updateItem(id, newQty); 
    } catch { 
      // Rollback
      setCartItems((items) =>
        items.map((i) => getItemId(i) === id ? { ...i, quantity: oldQty } : i)
      );
    }
  };

  const removeItem = async (id: string) => {
    const itemToRemove = cartItems.find((i) => getItemId(i) === id);
    if (!itemToRemove) return;
    const wasSelected = selectedIds.has(id);

    // Optimistic Update
    setCartItems((items) => items.filter((item) => getItemId(item) !== id));
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });

    try { 
      await cartService.removeItem(id); 
    } catch { 
      // Rollback
      setCartItems((items) => [...items, itemToRemove]);
      if (wasSelected) {
        setSelectedIds((prev) => { const next = new Set(prev); next.add(id); return next; });
      }
    }
  };

  /* Tính subtotal chỉ cho items đã chọn */
  const { subtotal, selectedCount } = useMemo(() => {
    let sub = 0;
    let count = 0;
    for (const item of cartItems) {
      if (selectedIds.has(getItemId(item))) {
        sub += (item.product?.price_per_unit || 0) * (item.quantity || 1);
        count++;
      }
    }
    return { subtotal: sub, selectedCount: count };
  }, [cartItems, selectedIds]);

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
        <p className="text-foreground-muted mb-6">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Link href="/catalog" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
          Khám phá nông sản
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Giỏ hàng ({cartItems.length})</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-surface border border-border rounded-xl">
            <button
              type="button"
              onClick={toggleSelectAll}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                allSelected
                  ? "bg-primary border-primary text-white"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary"
              }`}
            >
              {allSelected && <Check className="w-3 h-3" />}
            </button>
            <span className="text-sm font-medium text-foreground-muted">
              Chọn tất cả ({cartItems.length} sản phẩm)
            </span>
          </div>

          {cartItems.map((item) => {
            const id = getItemId(item);
            const isSelected = selectedIds.has(id);

            return (
              <div
                key={id}
                className={`bg-white dark:bg-surface rounded-xl p-4 flex gap-4 shadow-sm transition-all ${
                  isSelected ? "border-2 border-primary/30" : "border border-border"
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleSelect(id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 mt-2 ${
                    isSelected
                      ? "bg-primary border-primary text-white"
                      : "border-gray-300 dark:border-gray-600 hover:border-primary"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </button>

                {/* Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  {item.product?.images?.[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product?.name || ""}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <Link
                        href={`/products/${item.product?.id}`}
                        className="font-bold text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-xs text-foreground-muted">
                        Nhà vườn: {item.product?.shop?.name || "—"}
                      </p>
                    </div>
                    <button type="button"
                      onClick={() => removeItem(id)}
                      aria-label="Xóa sản phẩm"
                      className="p-1.5 text-foreground-muted hover:text-accent rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button type="button" onClick={() => updateQuantity(id, -1)} aria-label="Giảm" className="p-1.5 hover:bg-gray-50 dark:hover:bg-surface-hover">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity || 1}</span>
                      <button type="button" onClick={() => updateQuantity(id, 1)} aria-label="Tăng" className="p-1.5 hover:bg-gray-50 dark:hover:bg-surface-hover">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-bold text-primary text-lg">
                      {formatCurrency((item.product?.price_per_unit || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Đã chọn</span>
                <span className="font-medium">{selectedCount}/{cartItems.length} sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Tạm tính</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Phí giao hàng</span>
                <span className={`font-medium ${shippingFee === 0 && subtotal > 0 ? "text-green-600" : ""}`}>
                  {subtotal === 0 ? "—" : shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-base">Tổng cộng</span>
                <span className="font-bold text-xl text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => router.push('/checkout')}
              className="mt-6 w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thanh toán ({selectedCount})
            </button>
            <Link href="/catalog" className="mt-3 block text-center text-primary font-medium text-sm hover:underline">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
