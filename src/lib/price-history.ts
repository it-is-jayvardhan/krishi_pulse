"use client";

import { MandiRecord } from "@/types/mandi";

const HISTORY_KEY = "krishipulse:price-history";

// Store a map of [marketName]: MandiRecord
export function saveTodayDataToHistory(records: MandiRecord[]) {
  if (typeof window === "undefined" || records.length === 0) return;

  try {
    const existingRaw = window.localStorage.getItem(HISTORY_KEY);
    const history = existingRaw ? JSON.parse(existingRaw) : {};

    records.forEach((record) => {
      // We key it by market and commodity so it doesn't cross-pollinate
      const key = `${record.state}-${record.market}-${record.commodity}`;
      history[key] = record;
    });

    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history", e);
  }
}

export function getPreviousMarketData(currentRecord: MandiRecord): MandiRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const existingRaw = window.localStorage.getItem(HISTORY_KEY);
    if (!existingRaw) return null;

    const history = JSON.parse(existingRaw);
    const key = `${currentRecord.state}-${currentRecord.market}-${currentRecord.commodity}`;
    const previous = history[key];

    // Only return it if the date is actually older than the current record
    if (previous && previous.arrivalDate < currentRecord.arrivalDate) {
      return previous;
    }
  } catch {
    return null;
  }
  return null;
}