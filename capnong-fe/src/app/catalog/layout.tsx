import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh Mục Sản Phẩm",
  description:
    "Khám phá nông sản sạch từ khắp Việt Nam. Lọc theo loại, vùng miền, mùa vụ. Trái cây, rau củ, thủy sản tươi ngon từ nhà vườn.",
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
