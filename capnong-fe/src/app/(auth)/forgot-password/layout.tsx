import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên Mật Khẩu",
  description: "Đặt lại mật khẩu tài khoản Cạp Nông. Nhận mã OTP qua SĐT hoặc email để tạo mật khẩu mới.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
