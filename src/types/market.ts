export interface MarketRecord {
  id: string;
  date: string; // ISO date, e.g. "2026-07-14"
  commodity: string;
  market: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalQuantity: number; // in quintals
}

export type PriceTier = "highest" | "good" | "average" | "below" | "lowest";

export interface TierMeta {
  tier: PriceTier;
  label: string;
  emoji: string;
  bgVar: string;
  fgVar: string;
}

export const TIER_META: Record<PriceTier, TierMeta> = {
  highest: {
    tier: "highest",
    label: "Excellent Selling Price",
    emoji: "🟩",
    bgVar: "--tier-highest-bg",
    fgVar: "--tier-highest-fg",
  },
  good: {
    tier: "good",
    label: "Good Price",
    emoji: "🟩",
    bgVar: "--tier-good-bg",
    fgVar: "--tier-good-fg",
  },
  average: {
    tier: "average",
    label: "Average",
    emoji: "🟨",
    bgVar: "--tier-average-bg",
    fgVar: "--tier-average-fg",
  },
  below: {
    tier: "below",
    label: "Below Average",
    emoji: "🟧",
    bgVar: "--tier-below-bg",
    fgVar: "--tier-below-fg",
  },
  lowest: {
    tier: "lowest",
    label: "Poor Selling Price",
    emoji: "🟥",
    bgVar: "--tier-lowest-bg",
    fgVar: "--tier-lowest-fg",
  },
};

export interface MonthSummary {
  average: number;
  highest: number;
  lowest: number;
  count: number;
}
