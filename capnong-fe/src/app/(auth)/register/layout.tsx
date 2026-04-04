import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký",
  description:
    "Tạo tài khoản Cạp Nông miễn phí. Đăng ký làm Người mua hoặc Nông dân để bắt đầu mua bán nông sản sạch.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
