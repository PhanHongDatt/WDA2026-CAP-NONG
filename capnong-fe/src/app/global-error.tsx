"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🚜</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Hệ thống đang bảo trì
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Cạp Nông đang được cập nhật để phục vụ bạn tốt hơn. Vui lòng thử
            lại sau ít phút!
          </p>
          <button type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition-all"
          >
            🔄 Tải lại trang
          </button>
          {error.digest && (
            <p className="mt-4 text-xs text-gray-400">
              Mã lỗi: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
