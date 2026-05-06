"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { ALargeSmall } from "lucide-react";

/**
 * FontSizeToggle — Nút đơn mở slider cho nông dân chỉnh cỡ chữ.
 * Slider liên tục giữa 14px – 20px, snap vào 3 mức: small / medium / large.
 */

const SIZES = [
  { key: "small" as const, px: 14, label: "Nhỏ" },
  { key: "medium" as const, px: 16, label: "Vừa" },
  { key: "large" as const, px: 20, label: "Lớn" },
];

function sizeToValue(size: "small" | "medium" | "large"): number {
  return SIZES.find((s) => s.key === size)?.px ?? 16;
}

function valueToSize(px: number): "small" | "medium" | "large" {
  if (px <= 15) return "small";
  if (px >= 18) return "large";
  return "medium";
}

export default function FontSizeToggle() {
  const { fontSize, setFontSize } = useTheme();
  const [open, setOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState(sizeToValue(fontSize));
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Sync slider when fontSize changes externally
  useEffect(() => {
    setSliderValue(sizeToValue(fontSize));
  }, [fontSize]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popRef.current &&
        !popRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setSliderValue(val);
      setFontSize(valueToSize(val));
    },
    [setFontSize]
  );

  const currentLabel = SIZES.find((s) => s.key === fontSize)?.label ?? "Vừa";
  const currentPx = sizeToValue(fontSize);

  return (
    <div className="relative font-size-toggle-wrap hidden md:block">
      <button
        ref={btnRef}
        type="button"
        className={`header-icon-btn ${open ? "bg-gray-100 dark:bg-surface-hover" : ""}`}
        onClick={() => setOpen((p) => !p)}
        title="Chỉnh cỡ chữ"
        aria-label="Chỉnh cỡ chữ"
        aria-expanded={open}
      >
        <ALargeSmall className="w-5 h-5" />
      </button>

      {open && (
        <div ref={popRef} className="font-size-popover" role="dialog" aria-label="Chọn cỡ chữ">
          {/* Header */}
          <div className="font-size-popover-header">
            <span className="font-size-popover-title">Cỡ chữ</span>
            <span className="font-size-popover-value">{currentLabel} ({currentPx}px)</span>
          </div>

          {/* Slider */}
          <div className="font-size-slider-track-wrap">
            <span className="font-size-label-sm">A</span>
            <input
              type="range"
              min={14}
              max={20}
              step={1}
              value={sliderValue}
              onChange={handleSliderChange}
              className="font-size-slider"
              aria-label="Cỡ chữ"
            />
            <span className="font-size-label-lg">A</span>
          </div>

          {/* Snap dots */}
          <div className="font-size-snap-dots">
            {SIZES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`font-size-snap-dot ${fontSize === s.key ? "active" : ""}`}
                onClick={() => {
                  setFontSize(s.key);
                  setSliderValue(s.px);
                }}
                title={`${s.label} (${s.px}px)`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
