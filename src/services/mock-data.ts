import { MarketRecord } from "@/types/market";
import { MARKETS_BY_STATE } from "@/lib/constants";

// Small deterministic PRNG (mulberry32) so a given commodity+market+month+year
// combination always renders the same "data" across reloads and across the
// two calendars in the comparison view.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

const BASE_PRICE_BY_COMMODITY: Record<string, number> = {
  Tomato: 1800,
  Onion: 2200,
  Potato: 1400,
  Wheat: 2500,
  "Paddy (Rice)": 2100,
  Maize: 1900,
  Soybean: 4300,
  Cotton: 6800,
};

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Generates ~30-40 records spread across the given month (not every single
 * day necessarily reports arrivals, mirroring how real mandi data works).
 */
export function getMonthlyRecords(
  commodity: string,
  state: string,
  market: string,
  monthIndex: number, // 0-based
  year: number
): MarketRecord[] {
  const seedKey = `${commodity}|${state}|${market}|${monthIndex}|${year}`;
  const rand = mulberry32(hashSeed(seedKey));
  const base = BASE_PRICE_BY_COMMODITY[commodity] ?? 2000;
  const totalDays = daysInMonth(monthIndex, year);

  // Pick ~30-40 reporting days (or fewer if the month is short), weighted
  // toward covering most of the month.
  const targetCount = Math.min(totalDays, 30 + Math.floor(rand() * 11));
  const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);
  // shuffle
  for (let i = dayNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [dayNumbers[i], dayNumbers[j]] = [dayNumbers[j], dayNumbers[i]];
  }
  const chosenDays = dayNumbers.slice(0, targetCount).sort((a, b) => a - b);

  // A gentle sine-wave drift across the month plus daily noise, so the
  // calendar has a believable trend rather than pure randomness.
  const records: MarketRecord[] = chosenDays.map((day, idx) => {
    const drift = Math.sin((idx / targetCount) * Math.PI * 1.5) * base * 0.12;
    const noise = (rand() - 0.5) * base * 0.1;
    const modalPrice = Math.round(base + drift + noise);
    const spread = Math.round(base * (0.04 + rand() * 0.04));
    const minPrice = modalPrice - spread;
    const maxPrice = modalPrice + spread;
    const arrivalQuantity = Math.round(200 + rand() * 800);

    const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return {
      id: `${seedKey}|${day}`,
      date,
      commodity,
      market,
      state,
      minPrice,
      maxPrice,
      modalPrice,
      arrivalQuantity,
    };
  });

  return records;
}

export function getDefaultMarket(state: string): string {
  return MARKETS_BY_STATE[state]?.[0] ?? "";
}
