import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản trị hệ thống | Cạp Nông",
  description: "Trang quản trị: duyệt HTX, quản lý user, cấu hình mùa vụ toàn quốc.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
