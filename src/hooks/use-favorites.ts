"use client";

import * as React from "react";

const STORAGE_KEY = "krishipulse:favorite-commodities";

export function useFavorites() {
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  const toggleFavorite = React.useCallback((commodity: string) => {
    setFavorites((prev) => {
      const next = prev.includes(commodity)
        ? prev.filter((c) => c !== commodity)
        : [...prev, commodity];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore write failures (private browsing, quota, etc.)
      }
      return next;
    });
  }, []);

  const isFavorite = React.useCallback(
    (commodity: string) => favorites.includes(commodity),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, hydrated };
}
