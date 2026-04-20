"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  User, Phone, Mail, MapPin, Camera, Save, Shield, Send, Loader2, Plus, Edit2, Trash2, CheckCircle2
} from "lucide-react";
import { apiUserService, linkGoogleAccount, unlinkGoogleAccount } from "@/services/api/user";
import { apiUserAddressService, UserAddress, UserAddressRequest, getProvinces, getWards, Province, Ward } from "@/services/api/address";
import { useToast } from "@/components/ui/Toast";

function ProfileContent() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar_url: user?.avatar_url || "",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(form.avatar_url || null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  /* OTP flow for Email/Phone update */
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState(false);

  /* Addresses */
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<UserAddressRequest>({
    fullName: "", phone: "", street: "", district: "", province: "", isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Ward[]>([]);

  useEffect(() => {
    if (showAddressForm && provinces.length === 0) {
      getProvinces().then(data => setProvinces(data)).catch(() => {});
    }
  }, [showAddressForm, provinces.length]);

  const selectedProvinceCode = provinces.find(p => p.name === addressForm.province)?.code || "";

  useEffect(() => {
    if (selectedProvinceCode) {
      getWards(selectedProvinceCode).then(data => setDistricts(data)).catch(() => {});
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceCode]);

  /* Telegram notification */
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

  /* ── OTP Handlers ── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);
    if (value && index < 5) {
      document.getElementById(`profile-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      document.getElementById(`profile-otp-${index - 1}`)?.focus();
    }
  };

  /* ── Address Management ── */
  const fetchAddresses = useCallback(async () => {
    try {
      const list = await apiUserAddressService.getAddresses();
      // Ensure default is at top
      setAddresses(list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault)));
    } catch {
      showToast("error", "Không thể tải danh sách địa chỉ");
    } finally {
      setLoadingAddresses(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenAddressForm = (addr?: UserAddress) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        fullName: addr.fullName,
        phone: addr.phone,
        street: addr.street,
        district: addr.district,
        province: addr.province,
        isDefault: addr.isDefault
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        fullName: form.full_name, phone: form.phone, street: "", district: "", province: "", isDefault: false
      });
    }
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.street || !addressForm.district || !addressForm.province) {
      showToast("error", "Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }
    setSavingAddress(true);
    try {
      if (editingAddressId) {
        await apiUserAddressService.updateAddress(editingAddressId, addressForm);
        showToast("success", "Cập nhật địa chỉ thành công");
      } else {
        await apiUserAddressService.createAddress(addressForm);
        showToast("success", "Thêm địa chỉ thành công");
      }
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Lỗi lưu địa chỉ");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiUserAddressService.deleteAddress(id);
      showToast("success", "Đã xóa địa chỉ");
      fetchAddresses();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Lỗi xóa địa chỉ");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await apiUserAddressService.setDefault(id);
      showToast("success", "Đã đặt làm địa chỉ mặc định");
      fetchAddresses();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Lỗi đặt làm mặc định");
    }
  };

  /* ── Save profile → real API ── */
  const commitProfileUpdate = async () => {
    const otpSelected = showOtpInput ? otpCode.join("") : undefined;
    if (showOtpInput && (otpSelected?.length || 0) < 6) return;
    setSaving(true);
    setError("");
    try {
      await apiUserService.updateProfile({
        fullName: form.full_name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        otp: otpSelected
      });
      await refreshProfile?.();
      setSaved(true);
      setShowOtpInput(false);
      setOtpCode(["", "", "", "", "", ""]);
      showToast("success", "Cập nhật hồ sơ thành công");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi cập nhật hồ sơ";
      setError(msg);
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfileClick = async () => {
    // Check if email or phone changed
    const emailChanged = (form.email || "") !== (user?.email || "");
    const phoneChanged = (form.phone || "") !== (user?.phone || "");

    if (!emailChanged && !phoneChanged) {
      // Direct commit if no OTP required
      await commitProfileUpdate();
      return;
    }

    // Require OTP
    setSendingOtp(true);
    setError("");
    try {
      const targetIdentifier = phoneChanged ? form.phone : form.email;
      await apiUserService.sendUpdateOtp(targetIdentifier);
      setShowOtpInput(true);
      showToast("info", "Mã OTP đã được gửi.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi gửi mã OTP";
      setError(msg);
      showToast("error", msg);
    } finally {
      setSendingOtp(false);
    }
  };

  /* ── Avatar upload → real API ── */
  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

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
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const hasCheckedLinkRef = useRef(false);

  useEffect(() => {
    if (user?.google_id) setGoogleLinked(true);
  }, [user?.google_id]);

  // Catch OAuth redirect
  useEffect(() => {
    if (hasCheckedLinkRef.current) return;
    hasCheckedLinkRef.current = true;

    const checkSupabaseSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      // Wait for Supabase to parse the URL hash to session
      setTimeout(async () => {
        try {
          const { supabase } = await import("@/lib/supabase");
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.access_token) {
            // Check if we are doing linking flow or just lying around
            if (urlParams.get("action") === "link-google" || window.location.hash.includes("access_token")) {
              setGoogleLinking(true);
              // Clean up Url early to prevent double execution
              window.history.replaceState(null, "", "/profile");
              await linkGoogleAccount(session.access_token);
              await refreshProfile?.();
              setGoogleLinked(true);
              showToast("success", "Liên kết tài khoản Google thành công!");
            }
          }
        } catch (err) {
          if (urlParams.get("action") === "link-google" || window.location.hash.includes("access_token")) {
            showToast("error", "Lỗi liên kết Google: " + (err instanceof Error ? err.message : String(err)));
            window.history.replaceState(null, "", "/profile");
          }
        } finally {
          setGoogleLinking(false);
        }
      }, 500); // give gotrue-js a moment to parse hash
    };
    
    // Auto check on mount
    checkSupabaseSession();
  }, [showToast]);

  const handleLinkGoogle = async () => {
    setGoogleLinking(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/profile?action=link-google`,
          queryParams: {
            prompt: "consent",
          }
        },
      });
      if (error) throw error;
      // Trình duyệt sẽ chuyển hướng
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Fallback
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qpzhehhjzniegbcpzqqt.supabase.co";
      const redirectUrl = `${window.location.origin}/profile?action=link-google`;
      window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      showToast("error", "Lỗi Supabase JS: Đang thử chuyển hướng thủ công...");
      console.error(err);
      setGoogleLinking(false);
    }
  };

  const handleUnlinkGoogle = () => {
    setShowUnlinkConfirm(true);
  };

  const executeUnlinkGoogle = async () => {
    setShowUnlinkConfirm(false);
    setGoogleLinking(true);
    try {
      await unlinkGoogleAccount();
      await refreshProfile?.();
      setGoogleLinked(false);
      showToast("success", "Đã hủy liên kết tài khoản Google");
    } catch (err) {
      showToast("error", "Lỗi hủy liên kết: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGoogleLinking(false);
    }
  };

  const handleTelegramToggle = () => setTelegramEnabled(!telegramEnabled);

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
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-5 relative">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Thông tin cơ bản
        </h2>

        {error && <p className="text-sm text-accent">{error}</p>}

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

        {/* OTP Input Block */}
        {showOtpInput && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-5 mt-4">
            <p className="text-sm font-medium text-primary text-center">Vui lòng nhập mã OTP đã được gửi để xác nhận thay đổi.</p>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otpCode.map((digit, i) => (
                <input
                  key={i}
                  id={`profile-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <button 
                type="button"
                onClick={commitProfileUpdate}
                disabled={otpCode.join("").length < 6 || saving}
                className="w-full sm:w-1/2 bg-primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-primary-light disabled:opacity-50"
              >
                {saving ? "Xác nhận..." : "Xác nhận & Lưu"}
              </button>
            </div>
          </div>
        )}

        {/* Save Basic Info Button */}
        {!showOtpInput && (
          <div className="flex justify-end mt-4">
            <button type="button"
              onClick={handleSaveProfileClick}
              disabled={saving || sendingOtp}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-light transition-colors shadow shadow-primary/20 disabled:opacity-50 text-sm"
            >
              {sendingOtp || saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? "Đã lưu!" : "Lưu Thay Đổi"}
            </button>
          </div>
        )}
      </div>

      {/* Address Management */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Địa chỉ giao hàng
          </h2>
          {!showAddressForm && (
            <button onClick={() => handleOpenAddressForm()} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> Thêm địa chỉ mới
            </button>
          )}
        </div>

        {/* List Addresses */}
        {!showAddressForm && (
          <div className="space-y-3">
            {loadingAddresses && <p className="text-sm text-foreground-muted">Đang tải...</p>}
            {!loadingAddresses && addresses.length === 0 && (
              <p className="text-sm text-foreground-muted">Chưa có địa chỉ giao hàng nào.</p>
            )}
            {addresses.map((addr) => (
              <div key={addr.id} className={`p-4 rounded-xl border ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-border bg-gray-50 dark:bg-background-light'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm flex items-center gap-2">
                      {addr.fullName} 
                      {addr.isDefault && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase">Mặc định</span>}
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">{addr.phone}</p>
                    <p className="text-sm mt-1.5">{addr.street}, {addr.district}, {addr.province}</p>
                  </div>
                  <div className="flex gap-2">
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs font-medium text-gray-500 hover:text-primary transition-colors">
                        Đặt mặc định
                      </button>
                    )}
                    <button onClick={() => handleOpenAddressForm(addr)} className="p-1 text-gray-500 hover:text-blue-500 transition-colors" title="Sửa">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!addr.isDefault && (
                      <button onClick={() => handleDeleteAddress(addr.id)} className="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Address Form */}
        {showAddressForm && (
          <div className="bg-gray-50 dark:bg-background-light p-4 rounded-xl border border-border">
            <h3 className="font-bold text-sm mb-3">{editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ giao hàng mới'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="Họ và tên người nhận"
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="Số điện thoại"
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="Số nhà, đường"
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <select
                  value={addressForm.province}
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value, district: "" })}
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Chọn Tỉnh / Thành phố</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={addressForm.district}
                  onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                  disabled={!selectedProvinceCode}
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-surface"
                >
                  <option value="">Chọn Phường / Xã</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="isDefaultAddress"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="isDefaultAddress" className="text-sm text-gray-700 dark:text-foreground">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setShowAddressForm(false)} 
                className="px-4 py-2 bg-white border border-border text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveAddress} 
                disabled={savingAddress}
                className="px-4 py-2 bg-primary flex items-center gap-2 text-white text-sm font-bold rounded-lg hover:bg-primary-light disabled:opacity-50"
              >
                {savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security info - Đổi mật khẩu */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Đổi mật khẩu đăng nhập
        </h2>
        <div className="border border-gray-100 dark:border-border rounded-lg overflow-hidden">
          <button type="button" onClick={() => setShowPasswordForm(!showPasswordForm)} className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-surface-hover hover:bg-gray-100 dark:hover:bg-background transition-colors text-sm font-bold text-gray-700 dark:text-foreground">
            {showPasswordForm ? "Hủy đổi mật khẩu" : "Thay đổi mật khẩu"}
          </button>
          {showPasswordForm && (
            <div className="p-4 space-y-3 bg-white dark:bg-background">
              {passwordError && <p className="text-xs text-accent">{passwordError}</p>}
              {passwordSaved && <p className="text-xs text-success">Cập nhật mật khẩu thành công!</p>}
              <input type="password" placeholder="Mật khẩu hiện tại" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="password" placeholder="Mật khẩu mới" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="password" placeholder="Xác nhận mật khẩu mới" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {passwordForm.newPass && passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                <p className="text-[11px] text-accent mt-0.5">Mật khẩu xác nhận không khớp</p>
              )}
              <div className="flex justify-end mt-2">
                <button type="button" onClick={handlePasswordSave} disabled={!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                  Lưu Mật Khẩu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UC-39: Thông báo Telegram */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Kênh thông báo Telegram
        </h2>
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
                {googleLinked 
                  ? `Đã liên kết ${user?.google_email ? `(${user.google_email})` : user?.email ? `(${user.email})` : ""}` 
                  : "Chưa liên kết thẻ Google nào"}
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
            <button
              onClick={handleUnlinkGoogle}
              disabled={googleLinking}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
            >
              {googleLinking ? "Đang xử lý..." : "Hủy liên kết"}
            </button>
          )}
        </div>
      </div>

      {/* Unlink Confirmation Modal */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface w-full max-w-sm rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">Hủy liên kết tài khoản?</h3>
              <p className="text-sm text-gray-500 dark:text-foreground-muted">
                Bạn sẽ không thể sử dụng tài khoản Google này để đăng nhập vào {user?.email} nữa.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-background border-t border-gray-100 dark:border-border px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowUnlinkConfirm(false)}
                className="flex-1 px-4 py-2 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg text-sm font-medium text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                disabled={googleLinking}
              >
                Hủy
              </button>
              <button
                onClick={executeUnlinkGoogle}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
                disabled={googleLinking}
              >
                {googleLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
