"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Save,
  Shield,
  Send,
} from "lucide-react";

function ProfileContent() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar_url: user?.avatar_url || "",
    address_street: "",
    address_district: "",
    address_province: "",
  });

  const [saved, setSaved] = useState(false);

  /* UC-39: Telegram notification */
  const [telegramHandle, setTelegramHandle] = useState("");
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: gọi API PUT /users/me khi BE sẵn sàng
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground">Thông tin cá nhân</h1>
        <p className="text-foreground-muted mt-1">Cập nhật hồ sơ và địa chỉ giao hàng</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {form.full_name.charAt(0) || "?"}
            </div>
            <button type="button"
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
              aria-label="Thay đổi ảnh đại diện"
            >
              <Camera className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-foreground">{user?.full_name}</p>
            <span className="inline-block mt-1 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-dark text-primary">
              {user?.role?.replace("_", " ")}
            </span>
            {user?.htx_name && (
              <p className="text-xs text-foreground-muted mt-1">🏛️ {user.htx_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Thông tin cơ bản
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Họ và tên
            </label>
            <input
              id="profile-name"
              type="text"
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="profile-phone" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-email" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Email (tùy chọn)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="example@mail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Địa chỉ giao hàng mặc định
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="profile-street" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Số nhà, đường
            </label>
            <input
              id="profile-street"
              type="text"
              value={form.address_street}
              onChange={(e) => handleChange("address_street", e.target.value)}
              placeholder="123 Đường Nguyễn Huệ"
              className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="profile-district" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Quận / Huyện
            </label>
            <input
              id="profile-district"
              type="text"
              value={form.address_district}
              onChange={(e) => handleChange("address_district", e.target.value)}
              placeholder="Quận 1"
              className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="profile-province" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Tỉnh / Thành phố
            </label>
            <input
              id="profile-province"
              type="text"
              value={form.address_province}
              onChange={(e) => handleChange("address_province", e.target.value)}
              placeholder="TP. Hồ Chí Minh"
              className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Security info */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-3">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Bảo mật
        </h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-foreground">Mật khẩu</p>
            <p className="text-xs text-foreground-muted">Đổi mật khẩu đăng nhập</p>
          </div>
          <button type="button" className="text-sm text-primary font-medium hover:underline">
            Đổi mật khẩu
          </button>
        </div>
      </div>

      {/* UC-39: Telegram Notification Toggle */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Thông báo Telegram
        </h2>
        <p className="text-sm text-foreground-muted">
          Nhận thông báo đơn hàng mới, Bundle gom đơn, và tin nhắn quan trọng qua Telegram.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="profile-telegram" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Telegram username
            </label>
            <input
              id="profile-telegram"
              type="text"
              value={telegramHandle}
              onChange={(e) => setTelegramHandle(e.target.value)}
              placeholder="@your_username"
              className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => setTelegramEnabled(!telegramEnabled)}
              className={`relative w-12 h-7 rounded-full transition-colors ${telegramEnabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
              aria-label={telegramEnabled ? "Tắt thông báo Telegram" : "Bật thông báo Telegram"}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${telegramEnabled ? "left-[calc(100%-1.625rem)]" : "left-0.5"}`} />
            </button>
          </div>
        </div>
        <div className={`flex items-center gap-2 text-sm font-medium ${telegramEnabled ? "text-success" : "text-foreground-muted"}`}>
          {telegramEnabled ? "✅ Đã bật nhận thông báo Telegram" : "⚪ Chưa kết nối Telegram"}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button type="button"
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20"
        >
          <Save className="w-5 h-5" />
          {saved ? "✅ Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

/**
 * /profile — UC-03: Cập nhật thông tin cá nhân
 * Cần đăng nhập để truy cập
 */
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
