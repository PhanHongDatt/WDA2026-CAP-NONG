"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileEdit,
  Trash2,
  Plus,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const MOCK_DRAFTS = [
  {
    id: "draft-1",
    name: "Sầu Riêng Ri6 — Đồng Nai",
    price: 150000,
    image: "/images/products/sau-rieng.jpg",
    updated_at: "22/03/2026 14:30",
  },
  {
    id: "draft-2",
    name: "Mít Thái — Long An",
    price: 0,
    image: "",
    updated_at: "20/03/2026 09:15",
  },
];

/**
 * /dashboard/products/drafts — Quản lý sản phẩm nháp
 */
export default function ProductDraftsPage() {
  const [drafts, setDrafts] = useState(MOCK_DRAFTS);

  const handleDelete = (id: string) => {
    if (confirm("Xóa bản nháp này?")) {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground-muted" />
          </Link>
          <h1 className="text-2xl font-black text-foreground">Sản phẩm nháp</h1>
        </div>
        <Link href="/dashboard/products/new" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-light transition-colors shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" />
          Tạo mới
        </Link>
      </div>

      {/* Drafts list */}
      {drafts.length > 0 ? (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-white dark:bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-background-light overflow-hidden shrink-0">
                {draft.image ? (
                  <Image src={draft.image} alt={draft.name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                    <Package className="w-6 h-6 opacity-30" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{draft.name}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-foreground-muted">
                  {draft.price > 0 && <span className="font-medium text-primary">{formatCurrency(draft.price)}</span>}
                  {draft.price === 0 && <span className="text-warning font-medium">Chưa đặt giá</span>}
                  <span>·</span>
                  <span>Lưu lúc {draft.updated_at}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/dashboard/products/new?draft=${draft.id}`} className="p-2 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors" title="Chỉnh sửa">
                  <FileEdit className="w-4 h-4" />
                </Link>
                <button type="button" onClick={() => handleDelete(draft.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Xóa nháp">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-foreground-muted">
          <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có sản phẩm nháp nào</p>
        </div>
      )}
    </div>
  );
}
