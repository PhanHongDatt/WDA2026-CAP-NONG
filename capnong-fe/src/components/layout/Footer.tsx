import Link from "next/link";

/**
 * Footer — updated with real links and correct copyright year
 */
export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-surface border-t border-gray-200 dark:border-border pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Grid 4 cols */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h4 className="font-black text-primary text-xl mb-4">CẠP NÔNG</h4>
            <p className="text-sm text-gray-600 dark:text-foreground-muted leading-relaxed">
              Kết nối trực tiếp nông sản từ vườn đến bàn ăn. Đảm bảo chất
              lượng, minh bạch nguồn gốc và giá cả hợp lý nhất.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Về Cạp Nông</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
              <li><Link className="hover:text-primary transition-colors" href="/home">Trang chủ</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/catalog">Sản phẩm</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/cooperative">Hợp tác xã số</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/shops">Gian hàng</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
              <li><Link className="hover:text-primary transition-colors" href="/orders/lookup">Tra cứu đơn hàng</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/profile">Tài khoản của tôi</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/register">Đăng ký tài khoản</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/login">Đăng nhập</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Dành cho nông dân</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
              <li><Link className="hover:text-primary transition-colors" href="/dashboard">Quản lý gian hàng</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/dashboard/products/new">Đăng sản phẩm</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/shops/new">Tạo gian hàng</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/cooperative/create">Thành lập HTX</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-border pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-foreground-muted gap-4">
          <p>© 2026 Cạp Nông. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <span className="hover:text-primary cursor-pointer transition-colors">Facebook</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Zalo</span>
            <span className="hover:text-primary cursor-pointer transition-colors">TikTok</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
