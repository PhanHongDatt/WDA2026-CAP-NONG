import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="text-8xl mb-6">🌾</div>
        <h1 className="text-6xl font-black text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Trang không tìm thấy
        </h2>
        <p className="text-foreground-muted mb-8 leading-relaxed">
          Có vẻ bạn đã lạc vào ruộng rồi! Trang bạn tìm không tồn tại hoặc đã
          được chuyển đi nơi khác.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/home"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/5 transition-all"
          >
            <Search className="w-5 h-5" />
            Tìm sản phẩm
          </Link>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang trước
        </Link>
      </div>
    </div>
  );
}
