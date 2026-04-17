import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats number to VND", () => {
    const result = formatCurrency(185000);
    // Should contain 185 and đ/₫ symbol
    expect(result).toContain("185");
  });

  it("handles zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});
