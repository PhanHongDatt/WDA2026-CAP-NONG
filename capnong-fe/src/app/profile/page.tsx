"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
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
  Loader2,
} from "lucide-react";
import { apiUserService, linkGoogleAccount } from "@/services/api/user";
import * as notificationApi from "@/services/api/notification";

import { useToast } from "@/components/ui/Toast";

function ProfileContent() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(form.avatar_url || null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  /* UC-39: Telegram notification */
  const [telegramHandle, setTelegramHandle] = useState("");
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);

  /* Password change */
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setError("");
  };

  /* ── Save profile → real API ── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      await apiUserService.updateProfile({
        fullName: form.full_name,
        email: form.email || undefined,
        phone: form.phone || undefined,
      });
      // Refresh auth context so header/nav shows updated name
      await refreshProfile?.();
      setSaved(true);
      showToast("success", "Cập nhật hồ sơ thành công");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi cập nhật hồ sơ";
      setError(msg);
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  }, [form, refreshProfile, showToast]);

  /* ── Avatar upload → real API ── */
  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant preview
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to BE
    try {
      await apiUserService.uploadAvatar(file);
      await refreshProfile?.();
    } catch {
      // Preview already set, silent fail
    }
  }, [refreshProfile]);

  /* ── Change password → real API ── */
  const handlePasswordSave = useCallback(async () => {
    if (passwordForm.newPass !== passwordForm.confirm) return;
    setPasswordError("");
    try {
      await apiUserService.changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordSaved(true);
      setTimeout(() => {
        setPasswordSaved(false);
        setPasswordForm({ current: "", newPass: "", confirm: "" });
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Mật khẩu hiện tại không đúng";
      setPasswordError(msg);
    }
  }, [passwordForm]);

  /* ── UC-31: Link Google ── */
  const [googleLinked, setGoogleLinked] = useState(false);
  const [googleLinking, setGoogleLinking] = useState(false);

  const handleLinkGoogle = async () => {
    setGoogleLinking(true);
    try {
      // Gọi thử popup logic hoặc gửi mock signal để test UI (do Supabase Auth không popup được dễ ở đây nếu chưa setup SDK)
      // Trong thực tế sẽ gọi Supabase signInWithOAuth, lấy token => truyền cho linkGoogleAccount
      const mockSupabaseToken = "mock_token_" + Date.now();
      await linkGoogleAccount(mockSupabaseToken);
      setGoogleLinked(true);
      showToast("success", "Liên kết tài khoản Google thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi liên kết Google";
      showToast("error", msg);
    } finally {
      setGoogleLinking(false);
    }
  };

  /* ── UC-39: Telegram toggle → real API ── */
  const handleTelegramToggle = useCallback(async () => {
    setTelegramLoading(true);
    try {
      if (telegramEnabled) {
        await notificationApi.unlinkTelegram();
        setTelegramEnabled(false);
      } else {
        if (!telegramHandle.trim()) return;
        await notificationApi.registerTelegram(telegramHandle.replace("@", ""));
        setTelegramEnabled(true);
      }
    } catch {
      // silent
    } finally {
      setTelegramLoading(false);
    }
  }, [telegramEnabled, telegramHandle]);

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
            {avatarPreview ? (
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <Image src={avatarPreview} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {form.full_name.charAt(0) || "?"}
              </div>
            )}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" aria-label="Upload ảnh đại diện" onChange={handleAvatarChange} />
            <button type="button"
              onClick={() => avatarInputRef.current?.click()}
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

      {/* Security info - Đổi mật khẩu */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Đổi mật khẩu đăng nhập
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="pw-current" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Mật khẩu hiện tại</label>
            <input id="pw-current" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(p => ({...p, current: e.target.value}))} className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="sm:col-span-2 lg:col-span-1 border-l-0 lg:border-l border-gray-100 pl-0 lg:pl-6 space-y-4">
            <div>
              <label htmlFor="pw-new" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Mật khẩu mới</label>
              <input id="pw-new" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm(p => ({...p, newPass: e.target.value}))} className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label htmlFor="pw-confirm" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Xác nhận mật khẩu mới</label>
              <input id="pw-confirm" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm(p => ({...p, confirm: e.target.value}))} className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                <p className="text-xs text-accent mt-1">Mật khẩu không khớp</p>
              )}
            </div>
          </div>
        </div>
        {passwordError && (
          <p className="text-xs text-accent">{passwordError}</p>
        )}
        <div className="flex justify-end pt-2">
          <button type="button" onClick={handlePasswordSave} disabled={!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            {passwordSaved ? "✅ Đã đổi thành công!" : "Lưu mật khẩu mới"}
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
              onClick={handleTelegramToggle}
              disabled={telegramLoading}
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

      {/* UC-XX: Tài khoản liên kết (Google) */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Tài khoản liên kết
        </h2>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 dark:bg-background rounded-full flex items-center justify-center border border-border">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-foreground">Google</p>
              <p className={`text-xs ${googleLinked ? "text-success" : "text-foreground-muted"}`}>
                {googleLinked ? "Đã liên kết (someone@gmail.com)" : "Chưa liên kết thẻ Google nào"}
              </p>
            </div>
          </div>
          {!googleLinked && (
            <button
              onClick={handleLinkGoogle}
              disabled={googleLinking}
              className="px-4 py-2 bg-gray-100 dark:bg-background border border-border text-foreground hover:bg-gray-200 dark:hover:bg-surface-hover rounded-lg text-sm font-medium transition-colors"
            >
              {googleLinking ? "Đang xử lý..." : "Liên kết"}
            </button>
          )}
          {googleLinked && (
            <span className="px-3 py-1 bg-green-50 text-success text-xs font-bold rounded-full border border-green-200">
              Đã bật
            </span>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 items-center">
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saved ? "✅ Đã lưu!" : saving ? "Đang lưu..." : "Lưu thay đổi"}
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
