import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | Cạp Nông",
  description: "Cập nhật thông tin cá nhân, địa chỉ giao hàng và cài đặt bảo mật.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
