"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  MapPin,
  TreePine,
  Ruler,
  Calendar,
  Link as LinkIcon,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { shopService } from "@/services";
import { getMyShop } from "@/services/api/shop";
import { getProvinces, getWards, type Province, type Ward } from "@/services/api/address";
import { forceRefresh } from "@/services/api/auth";
import { generateSlug, isValidSlug } from "@/lib/slug";
import type { ShopFormData } from "@/services/types";
import Link from "next/link";
import ShopImageUpload from "@/components/shop/ShopImageUpload";
import { uploadShopImage } from "@/services/api/shop";

const INITIAL_FORM: ShopFormData = {
  name: "",
  slug: "",
  province: "",
  ward: "",
  bio: "",
  years_experience: undefined,
  farm_area_m2: undefined,
  avatar_url: "",
  cover_url: "",
};

function CreateShopContent() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState<ShopFormData>(INITIAL_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);

  // Province / Ward dropdown
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Check if user already has a shop → redirect
  useEffect(() => {
    async function check() {
      try {
        const existing = await getMyShop();
        if (existing) {
          router.replace("/dashboard/shop");
          return;
        }
      } catch { /* ignore */ }
      setCheckingExisting(false);
    }
    check();
  }, [router]);

  // Load provinces
  useEffect(() => {
    getProvinces().then(setProvinces).catch(() => {});
  }, []);

  // Load wards when province changes
  const selectedProvinceCode = provinces.find((p) => p.name === form.province)?.code || "";
  useEffect(() => {
    if (selectedProvinceCode) {
      getWards(selectedProvinceCode).then(setWards).catch(() => {});
    } else {
      setWards([]);
    }
  }, [selectedProvinceCode]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && form.name) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [form.name, slugManuallyEdited]);

  const handleChange = useCallback((field: keyof ShopFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    // Only allow valid slug chars
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    handleChange("slug", cleaned);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Tên vườn không được để trống";
    if (!form.slug.trim()) errs.slug = "Slug không được để trống";
    else if (!isValidSlug(form.slug)) errs.slug = "Slug chỉ chứa chữ cái thường, số và dấu gạch ngang";
    if (!form.province) errs.province = "Vui lòng chọn tỉnh/thành phố";
    if (!form.ward) errs.ward = "Vui lòng chọn xã/phường";
    if (form.years_experience !== undefined && form.years_experience < 0) errs.years_experience = "Số năm kinh nghiệm phải ≥ 0";
    if (form.farm_area_m2 !== undefined && form.farm_area_m2 < 0) errs.farm_area_m2 = "Diện tích vườn phải ≥ 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = await shopService.createShop!(form);
      // Lấy slug từ response để upload ảnh
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdSlug = (result as any)?.slug || form.slug;

      // Upload ảnh nếu có
      if (pendingAvatarFile && createdSlug) {
        try {
          await uploadShopImage(createdSlug, "avatar", pendingAvatarFile);
        } catch { /* avatar upload failure is non-critical */ }
      }
      if (pendingCoverFile && createdSlug) {
        try {
          await uploadShopImage(createdSlug, "cover", pendingCoverFile);
        } catch { /* cover upload failure is non-critical */ }
      }

      // Cập nhật lại Auth Context (lấy profile mới)
      await refreshProfile?.();
      // Bắt buộc gọi API refresh token để lấy JWT mới chứa shop_slug
      await forceRefresh().catch(() => {});
      
      showToast("success", "Tạo gian hàng thành công! 🎉");
      router.push("/dashboard/shop");
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : "Lỗi tạo gian hàng");
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/shop" className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-primary mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          Tạo gian hàng mới
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Điền thông tin vườn của bạn để bắt đầu bán nông sản trên Cạp Nông
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* ── Thông tin bắt buộc ── */}
        <div className="bg-white dark:bg-surface rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-bold text-foreground flex items-center gap-2 text-sm">
            <Store className="w-4 h-4 text-primary" />
            Thông tin cơ bản <span className="text-accent text-xs font-normal">(bắt buộc)</span>
          </h2>

          {/* Tên vườn */}
          <div>
            <label htmlFor="shop-name" className="block text-xs font-medium text-foreground-muted mb-1.5">
              Tên vườn / gian hàng
            </label>
            <input
              id="shop-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ví dụ: Vườn Xoài Bác Ba"
              className={`w-full px-4 py-2.5 bg-white dark:bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.name ? "border-accent" : "border-gray-200 dark:border-border"}`}
              maxLength={255}
            />
            {errors.name && (
              <p className="text-xs text-accent mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="shop-slug" className="block text-xs font-medium text-foreground-muted mb-1.5">
              <LinkIcon className="w-3 h-3 inline mr-1" />
              Đường dẫn (slug)
            </label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-2.5 bg-gray-100 dark:bg-surface-hover border border-r-0 border-gray-200 dark:border-border rounded-l-lg text-xs text-foreground-muted shrink-0">
                capnong.shop/shop/
              </span>
              <input
                id="shop-slug"
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="vuon-xoai-bac-ba"
                className={`w-full px-3 py-2.5 bg-white dark:bg-background border rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.slug ? "border-accent" : "border-gray-200 dark:border-border"}`}
                maxLength={100}
              />
            </div>
            {form.slug && isValidSlug(form.slug) && (
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đường dẫn hợp lệ
              </p>
            )}
            {errors.slug && (
              <p className="text-xs text-accent mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.slug}
              </p>
            )}
          </div>

          {/* Tỉnh / Huyện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shop-province" className="block text-xs font-medium text-foreground-muted mb-1.5">
                <MapPin className="w-3 h-3 inline mr-1" />
                Tỉnh / Thành phố
              </label>
              <select
                id="shop-province"
                value={form.province}
                onChange={(e) => {
                  handleChange("province", e.target.value);
                  handleChange("ward", "");
                }}
                className={`w-full px-3 py-2.5 bg-white dark:bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.province ? "border-accent" : "border-gray-200 dark:border-border"}`}
              >
                <option value="">Chọn tỉnh / thành phố</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
              {errors.province && (
                <p className="text-xs text-accent mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.province}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="shop-ward" className="block text-xs font-medium text-foreground-muted mb-1.5">
                Xã / Phường
              </label>
              <select
                id="shop-ward"
                value={form.ward}
                onChange={(e) => handleChange("ward", e.target.value)}
                disabled={!selectedProvinceCode}
                className={`w-full px-3 py-2.5 bg-white dark:bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-surface ${errors.ward ? "border-accent" : "border-gray-200 dark:border-border"}`}
              >
                <option value="">Chọn xã / phường</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
              {errors.ward && (
                <p className="text-xs text-accent mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.ward}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Thông tin tùy chọn ── */}
        <div className="bg-white dark:bg-surface rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-bold text-foreground flex items-center gap-2 text-sm">
            <TreePine className="w-4 h-4 text-primary" />
            Câu chuyện & Thông tin vườn <span className="text-foreground-muted text-xs font-normal">(tùy chọn)</span>
          </h2>

          {/* Bio */}
          <div>
            <label htmlFor="shop-bio" className="block text-xs font-medium text-foreground-muted mb-1.5">
              Câu chuyện người trồng
            </label>
            <textarea
              id="shop-bio"
              value={form.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Chia sẻ câu chuyện về vườn của bạn, phương pháp canh tác, tâm huyết với nghề..."
              rows={4}
              className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Kinh nghiệm & Diện tích */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shop-exp" className="block text-xs font-medium text-foreground-muted mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />
                Số năm kinh nghiệm
              </label>
              <input
                id="shop-exp"
                type="number"
                min={0}
                max={99}
                value={form.years_experience ?? ""}
                onChange={(e) => handleChange("years_experience", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ví dụ: 10"
                className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.years_experience && (
                <p className="text-xs text-accent mt-1">{errors.years_experience}</p>
              )}
            </div>
            <div>
              <label htmlFor="shop-area" className="block text-xs font-medium text-foreground-muted mb-1.5">
                <Ruler className="w-3 h-3 inline mr-1" />
                Diện tích vườn (m²)
              </label>
              <input
                id="shop-area"
                type="number"
                min={0}
                value={form.farm_area_m2 ?? ""}
                onChange={(e) => handleChange("farm_area_m2", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ví dụ: 5000"
                className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.farm_area_m2 && (
                <p className="text-xs text-accent mt-1">{errors.farm_area_m2}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Ảnh gian hàng ── */}
        <div className="bg-white dark:bg-surface rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-bold text-foreground flex items-center gap-2 text-sm">
            <Store className="w-4 h-4 text-primary" />
            Ảnh gian hàng <span className="text-foreground-muted text-xs font-normal">(tùy chọn — có thể thêm sau)</span>
          </h2>

          <ShopImageUpload
            label="Ảnh đại diện (avatar)"
            type="avatar"
            currentUrl={form.avatar_url}
            onUrlChange={(url) => handleChange("avatar_url", url)}
            onFileChange={(file) => setPendingAvatarFile(file)}
          />

          <ShopImageUpload
            label="Ảnh bìa (cover)"
            type="cover"
            currentUrl={form.cover_url}
            onUrlChange={(url) => handleChange("cover_url", url)}
            onFileChange={(file) => setPendingCoverFile(file)}
          />

          <p className="text-[10px] text-foreground-muted">
            Ảnh sẽ được tải lên sau khi tạo gian hàng thành công.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/shop"
            className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
          >
            Hủy
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-sm shadow-primary/20 text-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Store className="w-4 h-4" />
                Tạo gian hàng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * /dashboard/shop/create — Form tạo gian hàng mới (FARMER+)
 */
export default function CreateShopPage() {
  return (
    <ProtectedRoute roles={["FARMER", "HTX_MANAGER", "HTX_MEMBER"]}>
      <CreateShopContent />
    </ProtectedRoute>
  );
}
