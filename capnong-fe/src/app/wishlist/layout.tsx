import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách yêu thích | Cạp Nông",
  description: "Quản lý sản phẩm nông sản yêu thích và theo dõi giá tốt nhất.",
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
