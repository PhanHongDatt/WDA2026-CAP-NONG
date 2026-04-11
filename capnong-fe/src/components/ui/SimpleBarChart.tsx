"use client";

import { useMemo } from "react";

interface RevenueChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

/**
 * SimpleBarChart — Pure CSS bar chart (no D3/recharts dependency)
 * Responsive, dark mode, animated
 */
export default function SimpleBarChart({ data, height = 200 }: RevenueChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toString();
  };

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Value label */}
              <span className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {formatValue(d.value)}
              </span>
              {/* Bar */}
              <div
                className="w-full bg-primary/20 dark:bg-primary/30 rounded-t-md overflow-hidden relative"
                style={{ height: `${Math.max(pct, 3)}%` }}
              >
                <div
                  className="absolute inset-0 bg-primary rounded-t-md origin-bottom animate-[grow_0.5s_ease-out]"
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="flex gap-1.5 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] text-foreground-muted">{d.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes grow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
