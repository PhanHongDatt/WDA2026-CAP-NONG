"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AIRefinerProps {
  value: string;
  onAccept?: (refined: string) => void;
  placeholder?: string;
}

/* ── Vietnamese slang / typo correction map ── */
const SLANG_MAP: [RegExp, string][] = [
  [/\bko\b/gi, "không"],
  [/\bkhong\b/gi, "không"],
  [/\bdc\b/gi, "được"],
  [/\bduoc\b/gi, "được"],
  [/\bvs\b/gi, "với"],
  [/\bbt\b/gi, "bình thường"],
  [/\bngon lam\b/gi, "rất ngon"],
  [/\bngon lắm\b/gi, "rất ngon"],
  [/\btot lam\b/gi, "rất tốt"],
  [/\bthom lam\b/gi, "rất thơm"],
  [/\bnhiu\b/gi, "nhiều"],
  [/\bj\b/gi, "gì"],
  [/\broi\b/gi, "rồi"],
  [/\br\b/gi, "rồi"],
  [/\bnha\b/gi, "nhé"],
  [/\bcam xanh\b/gi, "cam sành"],
  [/\bk dùng\b/gi, "không sử dụng"],
  [/\bk có\b/gi, "không có"],
  [/\bk sử dụng\b/gi, "không sử dụng"],
  [/\bthuoc\b/gi, "thuốc"],
  [/\bhoa chat\b/gi, "hóa chất"],
  [/\bnhìu\b/gi, "nhiều"],
];

function refineText(raw: string): string {
  let text = raw.trim();
  // Apply slang/typo fixes
  for (const [pattern, replacement] of SLANG_MAP) {
    text = text.replace(pattern, replacement);
  }
  // Capitalize first letter of each sentence
  text = text.replace(/(^|\.\s+)([a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ])/g,
    (_, prefix, letter) => prefix + letter.toUpperCase()
  );
  // Ensure ends with period
  if (text && !text.endsWith(".") && !text.endsWith("!") && !text.endsWith("?")) {
    text += ".";
  }
  // Add professional suffix if short
  if (text.length < 100) {
    text += " Thu hoạch tại vườn, đảm bảo tươi ngon. Được chọn lọc kỹ từ những trái chín tự nhiên trên cây.";
  }
  return text;
}

export default function AIRefiner({
  value,
  onAccept,
  placeholder = "Nhập mô tả thô...",
}: AIRefinerProps) {
  const [state, setState] = useState<"idle" | "loading" | "preview">("idle");
  const [original, setOriginal] = useState(value);
  const [refined, setRefined] = useState("");

  // Sync with parent value
  useEffect(() => { if (value && !original) setOriginal(value); }, [value, original]);

  /* ── Try real AI API first, fallback to local regex ── */
  const handleRefine = async () => {
    if (!original.trim()) return;
    setState("loading");
    try {
      const aiApi = await import("@/services/api/ai");
      const result = await aiApi.refineDescription(original);
      if (result.refinedText) {
        setRefined(result.refinedText);
        setState("preview");
        return;
      }
    } catch {
      // API unavailable → local fallback
    }
    // Fallback: local regex refinement
    setRefined(refineText(original));
    setState("preview");
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
      <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
        <p className="text-xs font-bold text-primary">AI đề xuất chuẩn hóa:</p>

        {/* Diff: before / after */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
            <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Bản gốc</p>
            <p className="text-sm text-foreground-muted line-through">{original}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3">
            <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Đã chuẩn hóa</p>
            <p className="text-sm text-foreground">{refined}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={reject}
            className="text-sm text-foreground-muted hover:text-accent px-3 py-1.5 rounded-lg border border-border hover:border-accent transition-colors">
            Giữ bản gốc
          </button>
          <button type="button" onClick={accept}
            className="text-sm font-bold text-white bg-primary px-4 py-1.5 rounded-lg hover:bg-primary-light transition-colors">
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
        aria-label="Mô tả sản phẩm"
        className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none resize-none"
      />
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={handleRefine}
          disabled={state === "loading" || !original.trim()}
          className="text-xs text-primary font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "loading" ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Đang chuẩn hóa...
            </span>
          ) : (
            "AI chuẩn hóa mô tả"
          )}
        </button>
      </div>
    </div>
  );
}
