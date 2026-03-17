"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">🌱</div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Cạp Nông gặp trục trặc nhỏ
        </h2>
        <p className="text-foreground-muted mb-8 leading-relaxed">
          Đừng lo, đây chỉ là sự cố tạm thời. Hãy thử tải lại trang hoặc quay
          về trang chủ nhé!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
          >
            <RotateCcw className="w-5 h-5" />
            Thử lại
          </button>
          <Link
            href="/home"
            className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/5 transition-all"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-foreground-muted">
            Mã lỗi: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
