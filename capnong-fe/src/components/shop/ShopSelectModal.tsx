"use client";

import { X, Store, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Shop } from "@/types/shop";

interface ShopSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
}

export default function ShopSelectModal({ isOpen, onClose, shops }: ShopSelectModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelectShop = (isHtx: boolean) => {
    onClose();
    if (isHtx) {
      router.push("/cooperative/manage"); 
      // Hoặc trang quản lý chi tiết HTX Shop nếu có
    } else {
      router.push("/dashboard");
    }
  };

  const personalShop = shops.find(s => !s.isHtxShop);
  const htxShop = shops.find(s => s.isHtxShop);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-border">
          <h3 className="font-bold text-lg text-gray-900 dark:text-foreground">
            Chọn gian hàng thao tác
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 dark:text-foreground-muted mb-4">
            Bạn hiện đang quản lý nhiều gian hàng. Vui lòng chọn gian hàng bạn muốn thao tác:
          </p>

          {/* Personal Shop */}
          <button
            type="button"
            onClick={() => handleSelectShop(false)}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-border rounded-xl hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-foreground group-hover:text-primary transition-colors">
                {personalShop?.name || "Gian hàng cá nhân"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-foreground-muted">
                Dành cho tài khoản Nông dân
              </p>
            </div>
          </button>

          {/* HTX Shop */}
          <button
            type="button"
            onClick={() => handleSelectShop(true)}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-border rounded-xl hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-foreground group-hover:text-primary transition-colors">
                {htxShop?.name || "Gian hàng Hợp tác xã"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-foreground-muted">
                Bán sỉ và quản lý gom đơn
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
