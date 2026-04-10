"use client";

import { Component, type ReactNode } from "react";
import { RefreshCw, WifiOff, ServerCrash } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Fallback component khi có lỗi */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * ErrorBoundary — Bắt lỗi render + hiển thị UI retry
 * 
 * Trường hợp sử dụng:
 * - BE timeout → "Máy chủ đang bận, thử lại sau"
 * - Network fail → "Mất kết nối, kiểm tra mạng"
 * - Unknown → "Đã xảy ra lỗi, thử tải lại trang"
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isNetworkError =
        this.state.error?.message?.includes("fetch") ||
        this.state.error?.message?.includes("network") ||
        this.state.error?.message?.includes("Failed to fetch") ||
        this.state.error?.message?.includes("Network");

      const isTimeout =
        this.state.error?.message?.includes("timeout") ||
        this.state.error?.message?.includes("ECONNREFUSED") ||
        this.state.error?.message?.includes("503");

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] px-6 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            {isNetworkError ? (
              <WifiOff className="w-8 h-8 text-red-500" />
            ) : isTimeout ? (
              <ServerCrash className="w-8 h-8 text-amber-500" />
            ) : (
              <ServerCrash className="w-8 h-8 text-red-500" />
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">
            {isNetworkError
              ? "Mất kết nối mạng"
              : isTimeout
                ? "Máy chủ đang bận"
                : "Đã xảy ra lỗi"}
          </h3>

          <p className="text-sm text-gray-500 dark:text-foreground-muted mb-6 max-w-md">
            {isNetworkError
              ? "Vui lòng kiểm tra kết nối Internet và thử lại."
              : isTimeout
                ? "Máy chủ đang xử lý nhiều yêu cầu, vui lòng thử lại sau vài giây."
                : "Trang đã gặp sự cố không mong muốn. Bạn có thể tải lại để thử lại."}
          </p>

          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
            {this.state.retryCount > 0 && (
              <span className="text-xs opacity-70">({this.state.retryCount})</span>
            )}
          </button>

          {this.state.retryCount >= 3 && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Hoặc tải lại toàn bộ trang
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
