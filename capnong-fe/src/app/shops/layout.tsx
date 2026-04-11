import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cửa hàng nông sản | Cạp Nông",
  description: "Khám phá cửa hàng nông sản từ nông dân và HTX trên toàn quốc.",
};

export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
