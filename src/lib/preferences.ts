"use client";

import { useState, useEffect } from "react";

interface UserPrefs {
  state: string;
  commodity: string;
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("krishipulse:prefs");
      if (saved) setPrefs(JSON.parse(saved));
    } catch {
      // Ignore read errors
    } finally {
      setIsReady(true);
    }
  }, []);

  const savePrefs = (state: string, commodity: string) => {
    const next = { state, commodity };
    setPrefs(next);
    try {
      window.localStorage.setItem("krishipulse:prefs", JSON.stringify(next));
    } catch {
      // Ignore write errors
    }
  };

  const clearPrefs = () => {
    setPrefs(null);
    window.localStorage.removeItem("krishipulse:prefs");
  };

  return { prefs, savePrefs, clearPrefs, isReady };
}