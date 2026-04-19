"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Loader2, Eye, EyeOff, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { login: contextLogin } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google registration modal state
  const [showGoogleRegister, setShowGoogleRegister] = useState(false);
  const [googleToken, setGoogleToken] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleFullName, setGoogleFullName] = useState("");
  const [googleUsername, setGoogleUsername] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerDone, setRegisterDone] = useState(false);

  // Handle Google OAuth callback using onAuthStateChange (no race condition)
  useEffect(() => {
    let handled = false; // prevent double-fire in StrictMode

    const initAuth = async () => {
      const { supabase } = await import("@/lib/supabase");

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // Only handle SIGNED_IN from OAuth redirect
          if (handled) return;
          if (event !== "SIGNED_IN" || !session?.access_token) return;
          handled = true;

          setGoogleLoading(true);
          try {
            // Send Supabase token to BE (snake_case — Jackson global strategy)
            const api = (await import("@/services/api")).default;
            const res = await api.post<{
              message: string;
              data: {
                status: string;
                email?: string;
                full_name?: string;
                avatar_url?: string;
                auth_response?: {
                  access_token: string;
                  refresh_token: string;
                  username: string;
                  role: string;
                };
              };
            }>("/api/auth/oauth/google", {
              supabase_token: session.access_token, // snake_case — Jackson SNAKE_CASE in WebConfig.java
            });

            const result = res.data.data;

            if (result.status === "LOGIN_SUCCESS" && result.auth_response) {
              localStorage.setItem("access_token", result.auth_response.access_token);
              if (result.auth_response.refresh_token) {
                localStorage.setItem("refresh_token", result.auth_response.refresh_token);
              }
              localStorage.setItem("capnong-user", JSON.stringify({
                username: result.auth_response.username,
                role: result.auth_response.role,
                email: result.email,
              }));
              window.dispatchEvent(new Event("auth-changed"));
              showToast("success", "Đăng nhập Google thành công!");
              router.push("/home");
              router.refresh();
            } else if (result.status === "NEEDS_REGISTRATION") {
              // Show username modal popup directly
              setGoogleToken(session.access_token);
              setGoogleEmail(result.email || "");
              setGoogleFullName(result.full_name || "");
              setShowGoogleRegister(true);
            } else if (result.status === "EMAIL_CONFLICT") {
              showToast(
                "warning",
                `Email ${result.email} đã được sử dụng. Đăng nhập bằng mật khẩu rồi liên kết Google trong cài đặt.`
              );
            }
          } catch (err: unknown) {
            console.error("GOOGLE AUTH ERROR:", err);
            // Extract meaningful error from Axios response or generic Error
            let msg = "Vui lòng thử lại.";
            if (err && typeof err === "object" && "response" in err) {
              const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
              msg = axiosErr.response?.data?.message || `HTTP ${axiosErr.response?.status}`;
            } else if (err instanceof Error) {
              msg = err.message;
            }
            showToast("error", `Lỗi xác thực Google: ${msg}`);
          } finally {
            setGoogleLoading(false);
            // Clean URL hash before Next.js navigation takes over to avoid race conditions
            if (window.location.hash.includes("access_token")) {
              window.history.replaceState(null, "", window.location.pathname);
            }
          }
        }
      );

      // Cleanup subscription on unmount
      return () => subscription.unsubscribe();
    };

    // Only run if URL has OAuth hash
    if (window.location.hash?.includes("access_token")) {
      setGoogleLoading(true);
      initAuth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      showToast("error", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      await contextLogin(identifier, password);

      // Merge guest cart after login
      try {
        const { mergeGuestCart } = await import("@/services/api/cart");
        await mergeGuestCart();
      } catch {
        // Silent — guest cart might be empty
      }

      showToast("success", "Đăng nhập thành công!");
      router.push("/home");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Sai thông tin đăng nhập. Vui lòng thử lại.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
      // User sẽ được redirect sang Google → quay lại /login với hash token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Provide a fallback direct redirect to bypass crypto limitations in gotrue-js
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qpzhehhjzniegbcpzqqt.supabase.co";
      const redirectUrl = `${window.location.origin}/login`;
      window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      
      showToast("error", "Lỗi Supabase JS: Đang chuyển hướng bằng fallback...");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background-light">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-surface rounded-2xl shadow-lg border border-border p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
              <Leaf className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Đăng nhập</h1>
            <p className="text-foreground-muted text-sm mt-1">
              Chào mừng bạn quay lại Cạp Nông
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-2">
                Email hoặc Số điện thoại
              </label>
              <input
                id="login-email"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email hoặc SĐT"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none bg-white dark:bg-surface"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none bg-white dark:bg-surface"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary rounded" />
                <span className="text-foreground-muted">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/forgot-password" className="text-primary font-medium hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-foreground-muted uppercase tracking-wider">
              hoặc
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors disabled:opacity-60"
            >
              {googleLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang xác thực Google...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  Đăng nhập bằng Google
                </>
              )}
            </button>
          </div>

          {/* Register link */}
          <p className="text-center mt-6 text-sm text-foreground-muted">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
      {/* Google Registration Modal */}
      {showGoogleRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            {!registerDone && (
              <button
                type="button"
                onClick={() => setShowGoogleRegister(false)}
                className="absolute top-4 right-4 text-foreground-muted hover:text-foreground transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {registerDone ? (
              /* Success state */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-foreground">Đăng ký thành công!</h2>
                <p className="text-foreground-muted text-sm">Chào mừng bạn đến Cạp Nông 🌿</p>
                <button
                  type="button"
                  onClick={() => { router.push("/home"); router.refresh(); }}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-light transition-colors"
                >
                  Khám phá ngay
                </button>
              </div>
            ) : (
              /* Username form */
              <>
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl mb-3">
                    <Leaf className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-black text-foreground">Hoàn tất đăng ký</h2>
                  <p className="text-foreground-muted text-sm mt-1">Chọn username cho tài khoản Google</p>
                </div>

                {/* Google info badge */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-5">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                    </svg>
                    <div className="min-w-0">
                      {googleFullName && <p className="text-sm font-bold text-blue-700 dark:text-blue-300 truncate">{googleFullName}</p>}
                      <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{googleEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Username input */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="google-username" className="block text-sm font-medium mb-2">Chọn Username *</label>
                    <input
                      id="google-username"
                      type="text"
                      value={googleUsername}
                      onChange={(e) => setGoogleUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                      placeholder="vd: nguyenvana"
                      className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none bg-white dark:bg-surface"
                      autoFocus
                      maxLength={50}
                    />
                    <p className="text-xs text-foreground-muted mt-1">3-50 ký tự, chỉ chữ thường, số, dấu chấm, gạch ngang</p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!googleUsername.trim() || googleUsername.trim().length < 3) {
                        showToast("error", "Username phải từ 3 ký tự trở lên");
                        return;
                      }
                      setRegisterLoading(true);
                      try {
                        const api = (await import("@/services/api")).default;
                        const res = await api.post<{
                          success: boolean;
                          message: string;
                          data: {
                            access_token: string;
                            refresh_token: string;
                            username: string;
                            role: string;
                          };
                        }>("/api/auth/oauth/google/register", {
                          supabase_token: googleToken,
                          username: googleUsername.trim(),
                        });
                        const auth = res.data.data;
                        localStorage.setItem("access_token", auth.access_token);
                        if (auth.refresh_token) localStorage.setItem("refresh_token", auth.refresh_token);
                        localStorage.setItem("capnong-user", JSON.stringify({
                          username: auth.username,
                          role: auth.role,
                          email: googleEmail,
                        }));
                        window.dispatchEvent(new Event("auth-changed"));
                        setRegisterDone(true);
                        showToast("success", "Đăng ký thành công!");
                      } catch (err: unknown) {
                        let msg = "Đăng ký thất bại. Vui lòng thử lại.";
                        if (err && typeof err === "object" && "response" in err) {
                          const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
                          msg = axiosErr.response?.data?.message || `HTTP ${axiosErr.response?.status}`;
                        }
                        showToast("error", msg);
                      } finally {
                        setRegisterLoading(false);
                      }
                    }}
                    disabled={registerLoading || googleUsername.trim().length < 3}
                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
                  >
                    {registerLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Đang đăng ký...
                      </span>
                    ) : (
                      "Hoàn tất đăng ký"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
