"use client";

import * as React from "react";
import { MarketRecord } from "@/types/market";
import { getCached, setCached, CACHE_TTL } from "@/lib/api-cache";

function isCurrentOrFutureMonth(monthIndex: number, year: number) {
  const now = new Date();
  if (year > now.getFullYear()) return true;
  return year === now.getFullYear() && monthIndex >= now.getMonth();
}

/**
 * Fetches mandi prices + arrival quantities for a month RANGE in a single
 * API call (the endpoint already takes from_date/to_date, so there's no
 * need to fetch month-by-month). Prev/next navigation through the result
 * happens client-side in CalendarSection - it never triggers a refetch.
 */
export function usePrices(
  commodityId?: number,
  stateId?: number,
  districtId?: number,
  marketId?: number,
  startMonthIndex?: number,
  startYear?: number,
  endMonthIndex?: number,
  endYear?: number,
  commodityName: string = "",
  stateName: string = "",
  marketName: string = ""
) {
  const [records, setRecords] = React.useState<MarketRecord[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (
      !commodityId || !stateId || !districtId || !marketId ||
      startMonthIndex === undefined || !startYear ||
      endMonthIndex === undefined || !endYear
    ) {
      setRecords([]);
      setError(null);
      return;
    }

    const cacheKey = `agmarknet_prices_v1_${commodityId}_${stateId}_${districtId}_${marketId}_${startYear}_${startMonthIndex}_${endYear}_${endMonthIndex}`;
    // If the range reaches into the current (still-reporting) month, use a
    // short TTL so today's arrivals eventually show up. A fully historical
    // range never changes, so it's safe to cache indefinitely.
    const ttl = isCurrentOrFutureMonth(endMonthIndex, endYear) ? CACHE_TTL.CURRENT_MONTH_PRICES : undefined;

    async function fetchPrices() {
      const cached = getCached<MarketRecord[]>(cacheKey, ttl);
      if (cached) {
        setRecords(cached);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fromDate = `${startYear}-${String(startMonthIndex! + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(endYear!, endMonthIndex! + 1, 0).getDate();
        const toDate = `${endYear}-${String(endMonthIndex! + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const headers = { "Content-Type": "application/json" };
        const body = JSON.stringify({
          commodity_id: commodityId,
          state_id: stateId,
          district_id: [districtId],
          market_id: [marketId],
          from_date: fromDate,
          to_date: toDate
        });

        const [pricesRes, quantitiesRes] = await Promise.all([
          fetch("/api/agmarknet/prices", { method: "POST", headers, body }),
          fetch("/api/agmarknet/quantities", { method: "POST", headers, body })
        ]);

        if (!pricesRes.ok || !quantitiesRes.ok) {
          const failedRes = !pricesRes.ok ? pricesRes : quantitiesRes;
          const errorBody = await failedRes.json();

          if (failedRes.status === 429 || JSON.stringify(errorBody).toLowerCase().includes("limit exceeded")) {
            throw new Error("API limit exceeded. Please try again after 1 hour.");
          }

          throw new Error(errorBody.error || `Server responded with status ${failedRes.status}`);
        }

        const pricesResult = await pricesRes.json();
        const quantitiesResult = await quantitiesRes.json();

        const quantityMap = new Map<string, number>();
        if (quantitiesResult.output?.data) {
          quantitiesResult.output.data.forEach((item: any) => {
            const cleanDate = item.date.split("T")[0];
            quantityMap.set(cleanDate, item.quantity);
          });
        }

        if (pricesResult.output?.data) {
          const mapped: MarketRecord[] = pricesResult.output.data.map((item: any, idx: number) => {
            const cleanDate = item.date.split("T")[0];
            return {
              id: `${item.market_id}-${item.date}-${idx}`,
              date: cleanDate,
              commodity: commodityName,
              market: marketName,
              state: stateName,
              minPrice: item.min_price,
              maxPrice: item.max_price,
              modalPrice: item.modal_price,
              arrivalQuantity: quantityMap.get(cleanDate) || 0
            };
          });

          const sorted = mapped.sort((a, b) => a.date.localeCompare(b.date));
          setRecords(sorted);
          setCached(cacheKey, sorted);
        } else {
          setRecords([]);
        }
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [commodityId, stateId, districtId, marketId, startMonthIndex, startYear, endMonthIndex, endYear, commodityName, stateName, marketName]);

  return { records, loading, error };
}
