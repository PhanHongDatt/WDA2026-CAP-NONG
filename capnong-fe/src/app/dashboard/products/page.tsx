"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ProductEditModal from "./ProductEditModal";

type ProductStatus = "IN_SEASON" | "UPCOMING" | "OFF_SEASON" | "OUT_OF_STOCK" | "HIDDEN";

function statusBadge(s: ProductStatus) {
  switch (s) {
    case "IN_SEASON": return { label: "🟢 Đang mùa", cls: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" };
    case "UPCOMING": return { label: "🟡 Sắp thu hoạch", cls: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" };
    case "OFF_SEASON": return { label: "⚪ Ngoài mùa", cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };
    case "OUT_OF_STOCK": return { label: "🔴 Hết hàng", cls: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
    case "HIDDEN": return { label: "👁 Đã ẩn", cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };
  }
}

export type ProductItem = {
  id: string; name: string; category: string; price: number;
  quantity: number; status: ProductStatus; image: string; sold: number;
};

/**
 * /dashboard/products — UC-13: Chỉnh sửa / Ẩn / Xóa sản phẩm
 */
export default function ProductListPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQty, setEditQty] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { getSellerProducts } = await import("@/services/api/product");
      const result = await getSellerProducts(0, 50);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProducts(result.content.map((p: any) => ({
        id: p.id || p.slug,
        name: p.name,
        category: p.category || "Trái cây",
        price: p.price_per_unit || 0,
        quantity: p.available_quantity || 0,
        status: (p.status || "IN_SEASON") as ProductStatus,
        image: p.images?.[0] ? p.images[0] : "🥬",
        sold: p.sold_count || 0,
      })));
    } catch { 
      // If API error, show empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real products from API (mock fallback)
  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const { showToast } = useToast();

  const handleToggleHide = async (id: string, currentStatus: ProductStatus) => {
    const newStatus = currentStatus === "HIDDEN" ? "IN_SEASON" : "HIDDEN";
    try {
      const { updateProductStatus } = await import("@/services/api/product");
      await updateProductStatus(id, newStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus as ProductStatus } : p))
      );
      showToast("success", `Đã ${newStatus === "HIDDEN" ? "ẩn" : "hiện"} sản phẩm.`);
    } catch {
      showToast("error", "Đổi trạng thái thất bại.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { deleteProduct } = await import("@/services/api/product");
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
      showToast("success", "Đã xóa sản phẩm.");
    } catch {
      showToast("error", "Xóa sản phẩm thất bại.");
      setDeletingId(null);
    }
  };

  const handleStartEdit = (p: ProductItem) => {
    setDetailModalId(p.id);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const { updateProductPrice, updateProductQuantity } = await import("@/services/api/product");
      const newPrice = Number(editPrice);
      const newQty = Number(editQty);
      await Promise.all([
        updateProductPrice(id, newPrice),
        updateProductQuantity(id, newQty)
      ]);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: newPrice, quantity: newQty } : p))
      );
      setEditingId(null);
      showToast("success", "Cập nhật sản phẩm thành công.");
    } catch {
      showToast("error", "Cập nhật thất bại.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors" aria-label="Quay lại dashboard">
            <ArrowLeft className="w-5 h-5 text-foreground-muted" />
          </Link>
          <h1 className="text-2xl font-black text-foreground">Sản phẩm của tôi</h1>
        </div>
        <Link href="/dashboard/products/new" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Thêm SP
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 opacity-60">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-semibold text-gray-500">Đang tải sản phẩm...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-surface border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-1">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-gray-500 dark:text-foreground-muted max-w-sm">
            {search.trim() ? `Không có sản phẩm nào khớp với tìm kiếm "${search}"` : "Bạn chưa có sản phẩm nào. Hãy đăng bán sản phẩm đầu tiên để tiếp cận khách hàng!"}
          </p>
          {!search.trim() && (
            <Link href="/dashboard/products/new" className="mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Đăng bán ngay
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const badge = statusBadge(p.status);
            const isEditing = editingId === p.id;
            return (
              <div key={p.id} className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-background-light rounded-xl flex items-center justify-center text-3xl shrink-0">
                  {p.image.startsWith("http") || p.image.startsWith("data:") ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    p.image
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-foreground">{p.name}</h3>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {p.category}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <div>
                        <label htmlFor={`edit-price-${p.id}`} className="text-[10px] text-gray-400">Giá/đv</label>
                        <input id={`edit-price-${p.id}`} type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-28 px-2 py-1 border border-gray-200 dark:border-border rounded text-sm bg-white dark:bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div>
                        <label htmlFor={`edit-qty-${p.id}`} className="text-[10px] text-gray-400">Số lượng</label>
                        <input id={`edit-qty-${p.id}`} type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-24 px-2 py-1 border border-gray-200 dark:border-border rounded text-sm bg-white dark:bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <button type="button" onClick={() => handleSaveEdit(p.id)} className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 mt-3">Lưu</button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-gray-500 text-sm font-medium hover:underline mt-3">Hủy</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-foreground-muted">
                      <span className="font-bold text-primary">{formatCurrency(p.price)}</span>
                      <span>Tồn: {p.quantity}</span>
                      <span>Đã bán: {p.sold}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => handleStartEdit(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-lg transition-colors" aria-label="Sửa sản phẩm">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button type="button" onClick={() => handleToggleHide(p.id, p.status)} className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-lg transition-colors" aria-label={p.status === "HIDDEN" ? "Hiện sản phẩm" : "Ẩn sản phẩm"}>
                      {p.status === "HIDDEN" ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                    </button>
                    <button type="button" onClick={() => setDeletingId(p.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label="Xóa sản phẩm">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      <p className="text-sm text-foreground-muted text-center">
        {filtered.length} sản phẩm
      </p>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border">
            <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">
              Xóa sản phẩm
            </h3>
            <p className="text-gray-500 dark:text-foreground-muted mb-6 text-sm">
              Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 font-medium text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 font-medium text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Edit Modal */}
      {detailModalId && (
        <ProductEditModal 
          productId={detailModalId} 
          onClose={() => setDetailModalId(null)} 
          onSaved={() => {
            setDetailModalId(null);
            loadProducts();
          }} 
        />
      )}
    </div>
  );
}
