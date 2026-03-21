/**
 * Zod Validation Schemas — Cạp Nông
 *
 * Centralized form validation. Import and use with:
 *   const result = registerSchema.safeParse(formData);
 *   if (!result.success) { ... result.error.flatten().fieldErrors }
 */

import { z } from "zod";

/* ────────────── Helpers ────────────── */

const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
const phone = z.string().regex(phoneRegex, "SĐT không hợp lệ (VD: 0901234567)");

/* ────────────── Auth ────────────── */

export const loginSchema = z.object({
  phone: phone,
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Họ tên tối thiểu 2 ký tự").max(50, "Họ tên tối đa 50 ký tự"),
  phone: phone,
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  confirm_password: z.string(),
  role: z.enum(["BUYER", "FARMER"]),
}).refine((d) => d.password === d.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirm_password"],
});

/* ────────────── Checkout ────────────── */

export const checkoutSchema = z.object({
  name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: phone,
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().min(10, "Địa chỉ cần chi tiết hơn (tối thiểu 10 ký tự)"),
  note: z.string().optional(),
  payment_method: z.enum(["COD", "BANK"]),
});

/* ────────────── Products ────────────── */

export const newProductSchema = z.object({
  name: z.string().min(3, "Tên sản phẩm tối thiểu 3 ký tự").max(100, "Tên tối đa 100 ký tự"),
  description: z.string().min(20, "Mô tả tối thiểu 20 ký tự"),
  price: z.number().positive("Giá phải lớn hơn 0"),
  unit: z.enum(["Kg", "Trái", "Khay", "Bó", "Hộp"]),
  quantity: z.number().int().positive("Sản lượng phải > 0"),
  category: z.string().min(1, "Chọn danh mục"),
});

/* ────────────── Shop ────────────── */

export const newShopSchema = z.object({
  name: z.string().min(3, "Tên gian hàng tối thiểu 3 ký tự"),
  province: z.string().min(1, "Chọn tỉnh/thành"),
  commune: z.string().min(1, "Chọn xã/phường"),
  description: z.string().min(20, "Mô tả tối thiểu 20 ký tự"),
});

/* ────────────── HTX ────────────── */

export const createHtxSchema = z.object({
  name: z.string().min(5, "Tên HTX tối thiểu 5 ký tự"),
  registration_code: z.string().regex(/^[A-Z0-9-]{5,}$/, "Mã đăng ký không hợp lệ (chữ IN HOA, số, gạch ngang)"),
  province: z.string().min(1, "Chọn tỉnh/thành"),
  commune: z.string().min(1, "Chọn xã/phường"),
  description: z.string().optional(),
});

/* ────────────── Reviews ────────────── */

export const reviewSchema = z.object({
  rating: z.number().min(1, "Chọn số sao").max(5),
  comment: z.string().min(10, "Đánh giá tối thiểu 10 ký tự").max(500, "Tối đa 500 ký tự"),
});

/* ────────────── Profile ────────────── */

export const profileSchema = z.object({
  full_name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  bio: z.string().max(200, "Tiểu sử tối đa 200 ký tự").optional(),
});

/* ────────────── Utility: validate with error map ────────────── */

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const errors: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(fieldErrors)) {
    if (msgs && msgs.length > 0) errors[key] = msgs[0];
  }
  return { success: false, errors };
}
