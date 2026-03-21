"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  ArrowLeft,
  Building2,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
} from "lucide-react";

const PROVINCES = [
  "An Giang", "Bến Tre", "Bình Dương", "Bình Phước", "Cà Mau",
  "Cần Thơ", "Đắk Lắk", "Đồng Nai", "Đồng Tháp", "Hà Giang",
  "Hậu Giang", "Kiên Giang", "Lâm Đồng", "Long An", "Sóc Trăng",
  "Tây Ninh", "Tiền Giang", "Trà Vinh", "Vĩnh Long", "Vũng Tàu",
];

function CreateHtxContent() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    registration_code: "",
    province: "",
    commune: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // TODO: POST /api/htx khi BE sẵn sàng
    setSubmitted(true);
  };

  const codeValid = /^\d{8,12}$/.test(form.registration_code);
  const canSubmit = form.name.length >= 3 && codeValid && form.province && form.commune;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-3xl font-black text-foreground mb-3">Đã gửi yêu cầu!</h2>
        <p className="text-foreground-muted mb-2">
          HTX <span className="font-bold text-foreground">&quot;{form.name}&quot;</span> đang chờ ADMIN xét duyệt.
        </p>
        <p className="text-sm text-foreground-muted mb-8">
          Bạn sẽ nhận thông báo khi HTX được duyệt hoặc bị từ chối.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/cooperative" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
            Về Hợp tác xã
          </Link>
          <Link href="/dashboard" className="border border-gray-200 dark:border-border px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cooperative" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors" aria-label="Quay lại cooperative">
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground">Tạo HTX mới 🏛️</h1>
          <p className="text-foreground-muted mt-1">Khai báo chính thức để ADMIN xét duyệt</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-medium mb-1">📋 Quy trình:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-400">
          <li>Bạn điền thông tin và gửi yêu cầu</li>
          <li>ADMIN xét duyệt thủ công (tra cứu mã HTX)</li>
          <li>Nếu được duyệt → bạn trở thành <span className="font-bold">HTX_MANAGER</span></li>
        </ol>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Thông tin HTX
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="htx-name" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Tên HTX <span className="text-accent">*</span>
            </label>
            <input id="htx-name" type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="VD: HTX Trái Cây Bến Tre" className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label htmlFor="htx-code" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Mã đăng ký HTX (8-12 số) <span className="text-accent">*</span>
            </label>
            <input id="htx-code" type="text" maxLength={12} value={form.registration_code} onChange={(e) => handleChange("registration_code", e.target.value.replace(/\D/g, ""))} placeholder="VD: 12345678" className={`w-full px-4 py-2.5 bg-white dark:bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${form.registration_code && !codeValid ? "border-red-300 dark:border-red-800" : "border-gray-200 dark:border-border"}`} />
            {form.registration_code && !codeValid && (
              <p className="text-[11px] text-accent mt-1">Mã HTX phải từ 8-12 chữ số</p>
            )}
          </div>

          <div>
            <label htmlFor="htx-province" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Tỉnh/Thành phố <span className="text-accent">*</span>
            </label>
            <select id="htx-province" value={form.province} onChange={(e) => handleChange("province", e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Chọn tỉnh...</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="htx-commune" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Xã/Phường <span className="text-accent">*</span>
            </label>
            <input id="htx-commune" type="text" value={form.commune} onChange={(e) => handleChange("commune", e.target.value)} placeholder="VD: Xã Châu Thành" className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="htx-desc" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Mô tả hoạt động (tùy chọn)
            </label>
            <textarea id="htx-desc" rows={3} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Mô tả ngắn về HTX, lĩnh vực hoạt động..." className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Giấy tờ (tùy chọn)
        </h2>
        <div className="border-2 border-dashed border-gray-200 dark:border-border rounded-xl p-8 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-foreground-muted">Upload ảnh quyết định thành lập HTX</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF — tối đa 5MB</p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link href="/cooperative" className="border border-gray-200 dark:border-border px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
          Hủy
        </Link>
        <button type="button" onClick={handleSubmit} disabled={!canSubmit} className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
          <CheckCircle2 className="w-5 h-5" /> Gửi yêu cầu tạo HTX
        </button>
      </div>
    </div>
  );
}

/**
 * /cooperative/create — UC-07: Tạo HTX mới
 * FARMER chưa thuộc HTX nào mới được tạo
 */
export default function CreateHtxPage() {
  return (
    <ProtectedRoute roles={["FARMER"]}>
      <CreateHtxContent />
    </ProtectedRoute>
  );
}
