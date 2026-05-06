"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle — nút chuyển Dark/Light mode
 * Đặt trong Header hoặc Settings
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const handleToggleClick = () => {
    if (theme === "light") {
      setShowModal(true);
    } else {
      toggleTheme();
    }
  };

  const handleConfirmDark = () => {
    toggleTheme();
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <button type="button"
        onClick={handleToggleClick}
        className="header-icon-btn relative"
        aria-label={theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
        title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-surface rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Chế độ tối
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tính năng chưa hoàn thiện, vẫn muốn tiếp tục?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Trở lại light mode
              </button>
              <button
                onClick={handleConfirmDark}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-lg transition-colors"
              >
                Tiếp tục với dark mode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
