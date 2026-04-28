"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  ArrowLeft,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Eye,
  File,
  ImageIcon,
  Download,
} from "lucide-react";

import { getProvinces, getWards, Province, Ward } from "@/services/api/address";

interface UploadedDoc {
  url: string;
  name: string;
  type: "pdf" | "image";
}

function CreateHtxContent() {
  const { user: _user } = useAuth(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    registration_code: "",
    province: "", // Tên Tỉnh
    commune: "", // Tên xã/phường (Ward)
    description: "",
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | "">("");

  // Upload states — multiple documents
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Tải danh sách tỉnh ngay khi mở trang
  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  // Khi chọn Tỉnh, tải danh sách Phường/Xã
  const handleProvinceChange = (provinceCodeStr: string) => {
    if (!provinceCodeStr) {
      setSelectedProvinceCode("");
      setWards([]);
      setForm((p) => ({ ...p, province: "", commune: "" }));
      return;
    }
    const code = Number(provinceCodeStr);
    setSelectedProvinceCode(code);
    
    // Tìm tên tỉnh
    const provName = provinces.find((p) => p.code === code)?.name || "";
    setForm((p) => ({ ...p, province: provName, commune: "" }));

    // Tải Xã/Phường
    getWards(code).then(setWards).catch(console.error);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getFileType = (file: File): "pdf" | "image" => {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return "pdf";
    }
    return "image";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    try {
      const { uploadHtxDocument } = await import("@/services/api/htx");
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError(`Tệp "${file.name}" quá lớn (tối đa 5MB)`);
          continue;
        }
        
        const url = await uploadHtxDocument(file);
        const doc: UploadedDoc = {
          url,
          name: file.name,
          type: getFileType(file),
        };
        setDocuments((prev) => [...prev, doc]);
      }
    } catch {
      setUploadError("Tải lên giấy tờ thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Mở PDF trong tab mới bằng cách fetch blob (bypass Chrome PDF viewer 401)
   * Signed Cloudinary URL trả 401 khi Chrome PDF extension request không có referrer.
   * Giải pháp: fetch qua JS → tạo blob URL → open tab mới.
   */
  const openPdfInNewTab = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch {
      // Fallback: mở trực tiếp
      window.open(url, "_blank");
    }
  };

  const downloadPdf = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const { createHtx } = await import("@/services/api/htx");
      // Join multiple document URLs with comma if there are many
      const documentUrl = documents.length > 0
        ? documents.map((d) => d.url).join(",")
        : undefined;

      await createHtx({
        name: form.name,
        officialCode: form.registration_code,
        province: form.province,
        ward: form.commune,
        description: form.description || undefined,
        documentUrl,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Gửi yêu cầu thất bại.");
    } finally {
      setSubmitting(false);
    }
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
            <select id="htx-province" value={selectedProvinceCode} onChange={(e) => handleProvinceChange(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Chọn tỉnh...</option>
              {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="htx-commune" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Xã/Phường <span className="text-accent">*</span>
            </label>
            <select id="htx-commune" value={form.commune} onChange={(e) => handleChange("commune", e.target.value)} disabled={!selectedProvinceCode} className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:bg-gray-50">
              <option value="">Chọn Xã/Phường...</option>
              {wards.map((w) => <option key={w.code} value={w.name}>{w.name}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="htx-desc" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Mô tả hoạt động (tùy chọn)
            </label>
            <textarea id="htx-desc" rows={3} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Mô tả ngắn về HTX, lĩnh vực hoạt động..." className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
        </div>
      </div>

      {/* Upload Documents */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Giấy tờ (tùy chọn)
        </h2>
        <p className="text-xs text-gray-400 dark:text-foreground-muted">
          Tải lên quyết định thành lập, giấy phép kinh doanh, hoặc các giấy tờ liên quan. Hỗ trợ PDF, PNG, JPG — tối đa 5MB/tệp.
        </p>

        {/* Uploaded documents list */}
        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-background rounded-lg border border-gray-100 dark:border-border group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  doc.type === "pdf"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                }`}>
                  {doc.type === "pdf" ? (
                    <File className="w-5 h-5" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-[11px] text-gray-400 dark:text-foreground-muted">
                    {doc.type === "pdf" ? "Tệp PDF" : "Hình ảnh"} • Đã tải lên
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {doc.type === "pdf" ? (
                    <>
                      {/* PDF: fetch blob rồi mở tab mới (bypass Chrome PDF viewer 401) */}
                      <button
                        type="button"
                        onClick={() => openPdfInNewTab(doc.url)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="Xem PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* PDF: fetch blob rồi download */}
                      <button
                        type="button"
                        onClick={() => downloadPdf(doc.url, doc.name)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Tải xuống PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="Xem tài liệu"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(doc.url)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Xem trước"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Xóa tài liệu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload area */}
        <label className="block border-2 border-dashed border-gray-200 dark:border-border rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-surface-hover hover:border-primary/30 transition-all relative">
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-500 dark:text-foreground-muted">Đang tải lên...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/5 dark:bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-foreground">
                {documents.length > 0 ? "Thêm giấy tờ khác" : "Nhấn để tải lên giấy tờ"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, PDF — tối đa 5MB/tệp • Có thể chọn nhiều tệp
              </p>
            </div>
          )}
        </label>

        {documents.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{documents.length} tài liệu đã tải lên</span>
          </div>
        )}

        {uploadError && <p className="text-sm text-red-500 font-medium">{uploadError}</p>}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link href="/cooperative" className="border border-gray-200 dark:border-border px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
          Hủy
        </Link>
        {submitError && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-200">{submitError}</div>
        )}
        <button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting} className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...</> : <><CheckCircle2 className="w-5 h-5" /> Gửi yêu cầu tạo HTX</>}
        </button>
      </div>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-surface rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Xem trước tài liệu"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl bg-white"
            />
          </div>
        </div>
      )}
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
