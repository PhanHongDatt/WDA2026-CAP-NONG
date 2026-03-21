import type { Metadata } from "next";
import CooperativeContent from "./CooperativeContent";

export const metadata: Metadata = {
  title: "Gom Đơn Hàng",
  description: "Dashboard gom đơn thông minh. Hợp tác xã kỹ thuật số giúp nông dân giảm chi phí vận chuyển, tăng lợi nhuận.",
};

export default function CooperativePage() {
  return <CooperativeContent />;
}
