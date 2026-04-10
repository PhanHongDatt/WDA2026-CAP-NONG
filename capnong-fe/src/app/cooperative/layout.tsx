import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Hợp Tác Xã Số",
    template: "%s — HTX | Cạp Nông",
  },
  description: "Nền tảng Hợp Tác Xã Số trên Cạp Nông — gom đơn, chia sẻ kho vận, và truy xuất nguồn gốc tập thể.",
};

export default function CooperativeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
