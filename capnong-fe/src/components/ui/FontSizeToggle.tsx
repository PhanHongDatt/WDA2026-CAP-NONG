"use client";

import { useTheme } from "@/contexts/ThemeContext";

/**
 * FontSizeToggle — 3 cấp chữ cho nông dân cao tuổi
 * A⁻ (14px) | A (16px) | A⁺ (20px)
 */
export default function FontSizeToggle() {
  const { fontSize, setFontSize } = useTheme();

  const sizes = [
    { key: "small" as const, label: "A⁻", title: "Chữ nhỏ (14px)" },
    { key: "medium" as const, label: "A", title: "Chữ vừa (16px)" },
    { key: "large" as const, label: "A⁺", title: "Chữ lớn (20px)" },
  ];

  return (
    <div className="flex items-center border border-gray-200 dark:border-border rounded-lg overflow-hidden">
      {sizes.map((s) => (
        <button type="button"
          key={s.key}
          onClick={() => setFontSize(s.key)}
          className={`px-2.5 py-1.5 text-sm font-medium transition-colors ${
            fontSize === s.key
              ? "bg-primary text-white"
              : "text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover"
          }`}
          title={s.title}
          aria-label={s.title}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
