import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giỏ Hàng",
  description:
    "Xem lại giỏ hàng nông sản của bạn. Mua từ nhiều nhà vườn, miễn phí giao hàng cho đơn trên 300.000đ.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
