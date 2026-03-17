import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Sản Phẩm Mới",
  description:
    "Đăng bán nông sản trên Cạp Nông. Hỗ trợ nhập liệu bằng giọng nói AI, tự động chuẩn hóa mô tả sản phẩm.",
};

export default function NewProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
