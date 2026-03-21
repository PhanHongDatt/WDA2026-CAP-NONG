"use client";

import { useCallback } from "react";

interface ProgressBarProps {
  value: number;
  className?: string;
}

/**
 * Client-side ProgressBar — sets width via ref callback
 * to avoid inline `style` attribute (Edge DevTools no-inline-styles).
 */
export default function ProgressBar({ value, className = "" }: ProgressBarProps) {
  const refCb = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) el.style.width = `${value}%`;
    },
    [value]
  );

  return <div ref={refCb} className={className} />;
}
