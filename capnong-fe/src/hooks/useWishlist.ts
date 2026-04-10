"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "capnong-wishlist";

function loadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/**
 * useWishlist — Hook quản lý danh sách yêu thích (localStorage)
 *
 * - `toggle(id)`: thêm/xóa sản phẩm
 * - `isWishlisted(id)`: kiểm tra sản phẩm có trong wishlist
 * - `ids`: Set<string> chứa tất cả product IDs
 * - `clear()`: xóa toàn bộ
 *
 * Tự đồng bộ giữa các tab qua storage event.
 */
export function useWishlist() {
  const [ids, setIds] = useState<Set<string>>(() => loadIds());

  /* Sync across tabs */
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setIds(loadIds());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      saveIds(next);
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => ids.has(productId),
    [ids]
  );

  const clear = useCallback(() => {
    setIds(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { ids, toggle, isWishlisted, clear, count: ids.size };
}
