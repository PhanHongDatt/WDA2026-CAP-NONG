"use client";

import { useState } from "react";

const EMOJI_LIST = [
  "😊", "😍", "🤩", "👍", "👎", "❤️", "🔥", "⭐", "🌟", "💯",
  "🥰", "😋", "🤤", "😡", "😤", "😢", "🙏", "💪", "🎉", "✨",
  "🌿", "🍎", "🍊", "🥬", "🥕", "🌾", "🍇", "🥭", "🍑", "🥝",
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

/**
 * EmojiPicker — Simple inline emoji selector for reviews
 * Click icon → toggle picker → select emoji → insert into text
 */
export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-lg border transition-colors text-lg ${
          open
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-foreground-muted hover:border-primary hover:text-primary"
        }`}
        title="Thêm emoji"
      >
        😊
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-surface border border-border rounded-xl shadow-lg p-3 z-50 w-[260px]">
          <p className="text-[10px] text-foreground-muted uppercase tracking-wider mb-2 font-medium">Chọn emoji</p>
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_LIST.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  onSelect(e);
                  setOpen(false);
                }}
                className="w-6 h-6 flex items-center justify-center text-base hover:scale-125 transition-transform rounded hover:bg-gray-100 dark:hover:bg-surface-hover"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
