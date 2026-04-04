import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh Toán",
  description:
    "Hoàn tất đơn hàng nông sản. Hỗ trợ COD và chuyển khoản ngân hàng. Bảo mật thanh toán bởi Cạp Nông.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
