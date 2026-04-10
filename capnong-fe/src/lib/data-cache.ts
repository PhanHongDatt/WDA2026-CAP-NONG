/**
 * DataCache — Stale-While-Revalidate pattern cho client-side data
 * 
 * Cách hoạt động:
 * 1. Khi fetch data → lưu vào localStorage kèm timestamp
 * 2. Lần load tiếp → trả data cũ ngay lập tức (instant)
 * 3. Đồng thời gọi API mới → cập nhật cache + UI
 * 
 * Ref: Google web.dev — stale-while-revalidate pattern
 *      HTTP Cache-Control: stale-while-revalidate
 */

const CACHE_PREFIX = "capnong_cache_";

interface CachedEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_VERSION = 1;

/**
 * Lưu data vào localStorage cache
 */
export function setCache<T>(key: string, data: T): void {
  try {
    const entry: CachedEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full → clear old caches
    clearOldCaches();
  }
}

/**
 * Đọc data từ cache (trả null nếu hết hạn hoặc không có)
 * @param maxAgeMs - thời gian tối đa data được coi là "fresh" (ms)
 */
export function getCache<T>(key: string, maxAgeMs: number = 5 * 60 * 1000): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CachedEntry<T> = JSON.parse(raw);
    
    // Version mismatch → stale
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    // Age check
    const age = Date.now() - entry.timestamp;
    if (age > maxAgeMs) return null;

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Đọc cached data BẤT KỂ thời gian (cho offline mode)
 * Trả kèm age giúp UI hiển thị "Dữ liệu cập nhật X phút trước"
 */
export function getStaleCacheWithAge<T>(key: string): { data: T; ageMs: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CachedEntry<T> = JSON.parse(raw);
    if (entry.version !== CACHE_VERSION) return null;

    return {
      data: entry.data,
      ageMs: Date.now() - entry.timestamp,
    };
  } catch {
    return null;
  }
}

/**
 * Xóa cache cụ thể
 */
export function removeCache(key: string): void {
  localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Xóa tất cả cache theo pattern
 */
export function clearCacheByPattern(pattern: string): void {
  const keys = Object.keys(localStorage);
  keys.forEach((k) => {
    if (k.startsWith(CACHE_PREFIX) && k.includes(pattern)) {
      localStorage.removeItem(k);
    }
  });
}

/**
 * Xóa cache cũ nhất khi storage gần đầy
 */
function clearOldCaches(): void {
  const entries: { key: string; timestamp: number }[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CACHE_PREFIX)) continue;

    try {
      const entry = JSON.parse(localStorage.getItem(key) || "");
      entries.push({ key, timestamp: entry.timestamp || 0 });
    } catch {
      localStorage.removeItem(key!);
    }
  }

  // Sort oldest first → remove 50% oldest
  entries.sort((a, b) => a.timestamp - b.timestamp);
  const toRemove = entries.slice(0, Math.ceil(entries.length / 2));
  toRemove.forEach(({ key }) => localStorage.removeItem(key));
}

/**
 * Format cache age thành text tiếng Việt
 * "Vừa xong" | "5 phút trước" | "2 giờ trước" | "1 ngày trước"
 */
export function formatCacheAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return "Vừa xong";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
