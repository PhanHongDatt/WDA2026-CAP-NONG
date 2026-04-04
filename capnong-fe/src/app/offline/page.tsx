"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="w-24 h-24 bg-gray-100 dark:bg-surface rounded-full flex items-center justify-center mb-8">
        <span className="text-5xl">📡</span>
      </div>
      <h1 className="text-3xl font-black text-foreground mb-3">Mất kết nối mạng</h1>
      <p className="text-foreground-muted max-w-sm mb-8">
        Không thể tải trang. Vui lòng kiểm tra kết nối Internet và thử lại.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors"
      >
        Thử lại
      </button>
      <p className="text-xs text-foreground-muted mt-6">
        Cạp Nông — Kết nối thực chất, Giá trị bền vững 🌿
      </p>
    </div>
  );
}
