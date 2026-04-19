"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  ArrowLeft,
  Store,
  Camera,
  MapPin,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";

function CreateShopContent() {
  const { user: _user } = useAuth(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    bio: "",
    years_experience: "",
    farm_area_m2: "",
    address_street: "",
    address_district: "",
    address_province: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name") {
      // auto-generate slug from name
      const slug = value
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((prev) => ({ ...prev, slug: `vuon-${slug}` }));
    }
    setSaved(false);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const { shopService } = await import("@/services");
      if (shopService.createShop) {
        await shopService.createShop({
          name: form.name,
          slug: form.slug,
          province: form.address_province,
          district: form.address_district,
          bio: form.bio || undefined,
        });
      }
      setSaved(true);
      setTimeout(() => router.push(`/shop/${form.slug}`), 1500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Tạo gian hàng thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors" aria-label="Quay lại dashboard">
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground">Tạo gian hàng mới 🌿</h1>
          <p className="text-foreground-muted mt-1">Thiết lập gian hàng để bắt đầu bán nông sản</p>
        </div>
      </div>

      {/* Avatar & Cover */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-primary" />
          Hình ảnh
        </h2>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-background-light rounded-full flex items-center justify-center text-4xl mb-2">🧑‍🌾</div>
            <button type="button" className="text-xs text-primary font-medium hover:underline">Ảnh đại diện</button>
          </div>
          <div className="flex-1">
            <div className="w-full h-24 bg-gray-100 dark:bg-background-light rounded-xl flex items-center justify-center text-gray-400 text-sm">
              📷 Ảnh bìa gian hàng (tùy chọn)
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          Thông tin gian hàng
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="shop-name" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Tên vườn / gian hàng <span className="text-accent">*</span>
            </label>
            <input
              id="shop-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Vườn Xoài Bác Ba"
              className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="shop-slug" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              URL định danh (slug) <span className="text-accent">*</span>
            </label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-2.5 bg-gray-100 dark:bg-background-light border border-r-0 border-gray-200 dark:border-border rounded-l-lg text-sm text-gray-500">/shop/</span>
              <input
                id="shop-slug"
                type="text"
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="vuon-xoai-bac-ba"
                className="flex-1 px-3 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="shop-bio" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Câu chuyện nhà vườn (tùy chọn)
            </label>
            <textarea
              id="shop-bio"
              rows={3}
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Chia sẻ câu chuyện về vườn, kinh nghiệm canh tác..."
              className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div>
            <label htmlFor="shop-exp" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Số năm kinh nghiệm</label>
            <input id="shop-exp" type="number" value={form.years_experience} onChange={(e) => handleChange("years_experience", e.target.value)} placeholder="5" className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label htmlFor="shop-area" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Diện tích vườn (m²)</label>
            <input id="shop-area" type="number" value={form.farm_area_m2} onChange={(e) => handleChange("farm_area_m2", e.target.value)} placeholder="10000" className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Địa chỉ vườn <span className="text-accent text-sm">*</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="shop-street" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Địa chỉ chi tiết</label>
            <input id="shop-street" type="text" value={form.address_street} onChange={(e) => handleChange("address_street", e.target.value)} placeholder="Ấp 3, xã Long Khánh" className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label htmlFor="shop-district" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Quận / Huyện</label>
            <input id="shop-district" type="text" value={form.address_district} onChange={(e) => handleChange("address_district", e.target.value)} placeholder="Cai Lậy" className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label htmlFor="shop-province" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Tỉnh / Thành phố</label>
            <input id="shop-province" type="text" value={form.address_province} onChange={(e) => handleChange("address_province", e.target.value)} placeholder="Tiền Giang" className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link href="/dashboard" className="border border-gray-200 dark:border-border px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
          Hủy
        </Link>
        {submitError && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-200">{submitError}</div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || saved}
          className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang tạo...</> : saved ? <><CheckCircle2 className="w-5 h-5" /> Đã tạo!</> : <><Save className="w-5 h-5" /> Tạo gian hàng</>}
        </button>
      </div>
    </div>
  );
}

/**
 * /shops/new — UC-05: Tạo & chỉnh sửa gian hàng
 * FARMER trở lên mới được tạo
 */
export default function CreateShopPage() {
  return (
    <ProtectedRoute roles={["FARMER", "HTX_MEMBER", "HTX_MANAGER"]}>
      <CreateShopContent />
    </ProtectedRoute>
  );
}
