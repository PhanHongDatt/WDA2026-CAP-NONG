import { ShoppingCart, Package, Search, Inbox, FileText } from "lucide-react";
import Link from "next/link";

type EmptyVariant = "cart" | "orders" | "search" | "notifications" | "products";

const VARIANTS: Record<EmptyVariant, { icon: typeof ShoppingCart; title: string; description: string; action?: { label: string; href: string } }> = {
  cart: {
    icon: ShoppingCart,
    title: "Giỏ hàng trống",
    description: "Bạn chưa thêm sản phẩm nào. Hãy khám phá nông sản tươi ngon!",
    action: { label: "Khám phá sản phẩm", href: "/catalog" },
  },
  orders: {
    icon: Package,
    title: "Chưa có đơn hàng",
    description: "Bạn chưa đặt đơn hàng nào. Bắt đầu mua sắm nông sản sạch!",
    action: { label: "Mua sắm ngay", href: "/catalog" },
  },
  search: {
    icon: Search,
    title: "Không tìm thấy kết quả",
    description: "Không có sản phẩm nào phù hợp với bộ lọc. Thử thay đổi tiêu chí tìm kiếm.",
  },
  notifications: {
    icon: Inbox,
    title: "Không có thông báo",
    description: "Bạn đã đọc hết thông báo rồi. Mọi thứ đều ổn! 🎉",
  },
  products: {
    icon: FileText,
    title: "Chưa có sản phẩm",
    description: "Bạn chưa đăng sản phẩm nào. Tạo sản phẩm đầu tiên ngay!",
    action: { label: "Đăng sản phẩm", href: "/dashboard/products/new" },
  },
};

interface EmptyStateProps {
  variant: EmptyVariant;
  className?: string;
}

export default function EmptyState({ variant, className = "" }: EmptyStateProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-20 h-20 bg-gray-100 dark:bg-surface rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400 dark:text-foreground-muted" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">{config.title}</h3>
      <p className="text-sm text-gray-500 dark:text-foreground-muted max-w-xs mb-6">{config.description}</p>
      {config.action && (
        <Link
          href={config.action.href}
          className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-light transition-colors"
        >
          {config.action.label}
        </Link>
      )}
    </div>
  );
}
