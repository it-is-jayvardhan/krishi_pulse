import { MarketRecord, MonthSummary, PriceTier } from "@/types/market";

/**
 * Buckets a modal price into one of 5 tiers based on where it falls within
 * the month's own min/max range - so "highest" and "lowest" are always
 * relative to that month's actual data, per the PRD.
 */
export function getPriceTier(modalPrice: number, monthMin: number, monthMax: number): PriceTier {
  const range = monthMax - monthMin;
  if (range <= 0) return "average";

  const position = (modalPrice - monthMin) / range;

  if (position >= 0.8) return "highest";
  if (position >= 0.6) return "good";
  if (position >= 0.4) return "average";
  if (position >= 0.2) return "below";
  return "lowest";
}

export function getMonthSummary(records: MarketRecord[]): MonthSummary {
  if (records.length === 0) {
    return { average: 0, highest: 0, lowest: 0, count: 0 };
  }
  const modalPrices = records.map((r) => r.modalPrice);
  const sum = modalPrices.reduce((a, b) => a + b, 0);
  return {
    average: Math.round(sum / records.length),
    highest: Math.max(...modalPrices),
    lowest: Math.min(...modalPrices),
    count: records.length,
  };
}
