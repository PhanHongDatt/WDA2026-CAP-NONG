import { describe, it, expect } from "vitest";
import { validate, loginSchema, registerSchema, checkoutSchema, newProductSchema, reviewSchema } from "@/lib/validations";

describe("loginSchema", () => {
  it("passes with valid phone and password", () => {
    const result = validate(loginSchema, { phone: "0901234567", password: "abc123" });
    expect(result.success).toBe(true);
  });

  it("fails with invalid phone", () => {
    const result = validate(loginSchema, { phone: "0123", password: "abc123" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.phone).toBeDefined();
  });

  it("fails with short password", () => {
    const result = validate(loginSchema, { phone: "0901234567", password: "12" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.password).toBeDefined();
  });
});

describe("registerSchema", () => {
  const valid = { full_name: "Nguyen Van A", phone: "0901234567", password: "abc123", confirm_password: "abc123", role: "BUYER" as const };

  it("passes with valid data", () => {
    expect(validate(registerSchema, valid).success).toBe(true);
  });

  it("fails when passwords don't match", () => {
    const result = validate(registerSchema, { ...valid, confirm_password: "wrong" });
    expect(result.success).toBe(false);
  });

  it("fails with short name", () => {
    const result = validate(registerSchema, { ...valid, full_name: "A" });
    expect(result.success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  const valid = { name: "Nguyen Van A", phone: "0901234567", address: "123 Nguyen Hue, Quan 1, TPHCM", payment_method: "COD" as const };

  it("passes with valid data", () => {
    expect(validate(checkoutSchema, valid).success).toBe(true);
  });

  it("fails with short address", () => {
    const result = validate(checkoutSchema, { ...valid, address: "123" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.address).toBeDefined();
  });
});

describe("newProductSchema", () => {
  it("fails when price is 0", () => {
    const result = validate(newProductSchema, { name: "Test Product", description: "A long description here", price: 0, unit: "Kg", quantity: 10, category: "Trái cây" });
    expect(result.success).toBe(false);
  });

  it("fails when description too short", () => {
    const result = validate(newProductSchema, { name: "Test", description: "Short", price: 100, unit: "Kg", quantity: 10, category: "Trái cây" });
    expect(result.success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("passes with valid rating and comment", () => {
    const result = validate(reviewSchema, { rating: 5, comment: "Sản phẩm rất tốt, tôi rất hài lòng" });
    expect(result.success).toBe(true);
  });

  it("fails with rating 0", () => {
    const result = validate(reviewSchema, { rating: 0, comment: "Sản phẩm rất tốt" });
    expect(result.success).toBe(false);
  });

  it("fails with short comment", () => {
    const result = validate(reviewSchema, { rating: 5, comment: "Tốt" });
    expect(result.success).toBe(false);
  });
});
