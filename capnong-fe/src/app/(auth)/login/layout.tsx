import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập",
  description: "Đăng nhập vào Cạp Nông để mua bán nông sản sạch trực tiếp từ nhà vườn Việt Nam.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
