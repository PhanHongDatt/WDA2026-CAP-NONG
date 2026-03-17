"use client";

import { useState } from "react";
import { Sparkles, Check, X, ArrowRight, Loader2 } from "lucide-react";

interface AIRefinerProps {
  value: string;
  onAccept?: (refined: string) => void;
  placeholder?: string;
}

export default function AIRefiner({
  value,
  onAccept,
  placeholder = "Nhập mô tả thô...",
}: AIRefinerProps) {
  const [state, setState] = useState<"idle" | "loading" | "preview">("idle");
  const [original, setOriginal] = useState(value);
  const [refined, setRefined] = useState("");

  const handleRefine = () => {
    if (!original.trim()) return;
    setState("loading");

    // Simulate AI refinement
    setTimeout(() => {
      setRefined(
        `${original
          .replace(/cam xanh/gi, "cam sành")
          .replace(/ko/gi, "không")
          .replace(/đc/gi, "được")} — Thu hoạch tại vườn, đảm bảo tươi ngon, đạt chuẩn VietGAP. Được chọn lọc kỹ từ những trái chín tự nhiên trên cây.`
      );
      setState("preview");
    }, 1500);
  };

  const accept = () => {
    onAccept?.(refined);
    setOriginal(refined);
    setState("idle");
  };

  const reject = () => {
    setState("idle");
  };

  if (state === "preview") {
    return (
      <div className="border-2 border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-bold text-primary">AI đề xuất:</span>
        </div>

        {/* Diff Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">
              Bản gốc
            </p>
            <p className="text-sm text-foreground-muted line-through">
              {original}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-[10px] font-bold text-success uppercase tracking-wider mb-1">
              Đã chuẩn hóa
            </p>
            <p className="text-sm text-foreground">{refined}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={reject}
            className="flex items-center gap-1 text-sm text-foreground-muted hover:text-accent px-3 py-1.5 rounded-lg border border-border hover:border-accent transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Giữ bản gốc
          </button>
          <button
            onClick={accept}
            className="flex items-center gap-1 text-sm font-bold text-white bg-primary px-4 py-1.5 rounded-lg hover:bg-primary-light transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Dùng bản AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <textarea
        value={original}
        onChange={(e) => setOriginal(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none resize-none"
      />
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={handleRefine}
          disabled={state === "loading" || !original.trim()}
          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              AI chuẩn hóa mô tả
            </>
          )}
        </button>
      </div>
    </div>
  );
}
