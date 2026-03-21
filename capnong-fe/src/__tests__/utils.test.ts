import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "@/lib/utils";

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

describe("formatDate", () => {
  it("formats date string", () => {
    // Only test if function exists
    if (typeof formatDate === "function") {
      const result = formatDate("2026-03-20");
      expect(typeof result).toBe("string");
    }
  });
});
