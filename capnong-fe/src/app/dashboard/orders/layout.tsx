import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Đơn Hàng",
  description:
    "Xem và quản lý đơn hàng. Xác nhận, chuẩn bị hàng, cập nhật trạng thái giao hàng cho người mua.",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
