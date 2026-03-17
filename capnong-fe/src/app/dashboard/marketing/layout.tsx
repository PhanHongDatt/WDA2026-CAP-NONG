import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Marketing Lab",
  description:
    "Tạo caption Facebook, tách nền ảnh, và thiết kế ấn phẩm quảng cáo nông sản bằng AI.",
};

export default function MarketingLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
