import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi | Cạp Nông",
  description: "Theo dõi và quản lý đơn hàng nông sản, xem lịch sử mua hàng.",
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
