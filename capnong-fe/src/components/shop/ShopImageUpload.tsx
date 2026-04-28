"use client";

import { useState, useRef } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";

interface ShopImageUploadProps {
  label: string;
  type: "avatar" | "cover";
  currentUrl?: string;
  onUrlChange: (url: string) => void;
  /** Called when user selects a file (before upload). Useful for deferred upload in create flow. */
  onFileChange?: (file: File | null) => void;
  /** If slug is provided, upload happens immediately via API. Otherwise just preview locally. */
  slug?: string;
  uploadFn?: (slug: string, type: "avatar" | "cover", file: File) => Promise<string>;
}

/**
 * ShopImageUpload — Component upload ảnh avatar hoặc cover cho gian hàng.
 * - Khi có slug: upload trực tiếp lên server và trả về URL.
 * - Khi không có slug (form tạo mới): chỉ preview tạm, URL được set sau khi tạo shop.
 */
export default function ShopImageUpload({
  label,
  type,
  currentUrl,
  onUrlChange,
  onFileChange,
  slug,
  uploadFn,
}: ShopImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview || currentUrl;
  const isAvatar = type === "avatar";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh (jpg, png, webp...)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File ảnh quá lớn. Tối đa 5MB.");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // If we have slug and uploadFn, upload immediately
    if (slug && uploadFn) {
      setUploading(true);
      try {
        const url = await uploadFn(slug, type, file);
        onUrlChange(url);
        setPendingFile(null);
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Upload ảnh thất bại. Vui lòng thử lại.");
        setPreview(null);
      } finally {
        setUploading(false);
      }
    } else {
      // Store file for later upload after shop creation
      setPendingFile(file);
      onFileChange?.(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setPendingFile(null);
    onUrlChange("");
    onFileChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Expose pendingFile via data attribute for parent to access
  return (
    <div data-pending-file={pendingFile ? "true" : undefined}>
      <label className="block text-xs font-medium text-foreground-muted mb-2">
        {isAvatar ? <Camera className="w-3 h-3 inline mr-1" /> : <ImagePlus className="w-3 h-3 inline mr-1" />}
        {label}
      </label>

      {isAvatar ? (
        /* ─── Avatar: Circle ─── */
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-200 dark:border-border overflow-hidden bg-gray-50 dark:bg-surface-hover">
            {displayUrl ? (
              <>
                <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
                {!uploading && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Camera className="w-6 h-6" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 text-xs font-medium bg-gray-100 dark:bg-surface-hover text-foreground rounded-lg hover:bg-gray-200 dark:hover:bg-border transition-colors disabled:opacity-50"
            >
              {displayUrl ? "Thay đổi" : "Chọn ảnh"}
            </button>
            <p className="text-[10px] text-foreground-muted mt-1">JPG, PNG. Tối đa 5MB</p>
          </div>
        </div>
      ) : (
        /* ─── Cover: Rectangle banner ─── */
        <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-200 dark:border-border overflow-hidden bg-gray-50 dark:bg-surface-hover">
          {displayUrl ? (
            <>
              <img src={displayUrl} alt="Cover" className="w-full h-full object-cover" />
              {!uploading && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <ImagePlus className="w-8 h-8" />
              <span className="text-xs">Nhấn để chọn ảnh bìa</span>
              <span className="text-[10px]">Khuyến nghị 1200×400px. Tối đa 5MB</span>
            </button>
          )}
          {displayUrl && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-2 right-2 px-3 py-1.5 text-xs font-medium bg-white/90 dark:bg-surface/90 backdrop-blur rounded-lg shadow-sm hover:bg-white dark:hover:bg-surface transition-colors disabled:opacity-50"
            >
              Thay đổi
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
