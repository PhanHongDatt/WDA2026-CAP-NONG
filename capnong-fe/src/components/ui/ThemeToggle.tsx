"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle — nút chuyển Dark/Light mode
 * Đặt trong Header hoặc Settings
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
      aria-label={theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
      title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}
