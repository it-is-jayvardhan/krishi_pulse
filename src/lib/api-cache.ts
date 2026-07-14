/**
 * Shared localStorage-backed cache with optional TTL.
 *
 * Uses localStorage (not sessionStorage) so cached data survives across
 * browser sessions/tabs - important given the CEDA API's tight 40
 * requests/hour limit. Pass `maxAgeMs` to expire entries after a fixed
 * window, or omit it to cache indefinitely (good for data that's
 * effectively immutable, like historical mandi prices for a past month).
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function getCached<T>(key: string, maxAgeMs?: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (maxAgeMs !== undefined && Date.now() - entry.timestamp > maxAgeMs) {
      return null;
    }
    return entry.data;
  } catch {
    // Corrupt entry or JSON parse failure - treat as a cache miss.
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore quota errors / private browsing write failures - caching is
    // an optimization, not a correctness requirement.
  }
}

// Common TTLs, in milliseconds.
export const CACHE_TTL = {
  /** Commodities/states/districts/markets - reference data that almost never changes. */
  REFERENCE_DATA: 30 * 24 * 60 * 60 * 1000, // 30 days
  /** Prices for the current, still-being-reported month. */
  CURRENT_MONTH_PRICES: 6 * 60 * 60 * 1000, // 6 hours
} as const;

export function isCurrentMonth(monthIndex: number, year: number): boolean {
  const now = new Date();
  return monthIndex === now.getMonth() && year === now.getFullYear();
}
