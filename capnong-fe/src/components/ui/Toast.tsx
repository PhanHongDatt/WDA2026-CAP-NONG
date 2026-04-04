"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, X, Info } from "lucide-react";

/* ────────────── Types ────────────── */

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

/* ────────────── Icons & Styles ────────────── */

const TOAST_CONFIG: Record<ToastType, { icon: typeof CheckCircle2; bg: string; text: string }> = {
  success: { icon: CheckCircle2, bg: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-300" },
  error: { icon: AlertTriangle, bg: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-300" },
  warning: { icon: AlertTriangle, bg: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800", text: "text-yellow-700 dark:text-yellow-300" },
  info: { icon: Info, bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300" },
};

/* ────────────── Provider ────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type];
          const Icon = config.icon;
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${config.bg}`}
              role="alert"
            >
              <Icon className={`w-5 h-5 shrink-0 ${config.text}`} />
              <p className={`text-sm font-medium flex-1 ${config.text}`}>{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} className={`shrink-0 ${config.text} hover:opacity-70`} aria-label="Đóng thông báo">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
