"use client";

import * as React from "react";
import { getCached, setCached, CACHE_TTL } from "@/lib/api-cache";

export interface Market { id: number; name: string; }

export function useMarkets(commodityId?: number, stateId?: number, districtId?: number) {
  const [markets, setMarkets] = React.useState<Market[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!commodityId || !stateId || !districtId) {
      setMarkets([]);
      setError(null);
      return;
    }

    const cacheKey = `agmarknet_markets_v1_${commodityId}_${stateId}_${districtId}`;

    async function fetchMarkets() {
      const cached = getCached<Market[]>(cacheKey, CACHE_TTL.REFERENCE_DATA);
      if (cached) {
        setMarkets(cached);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/agmarknet/markets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commodity_id: commodityId,
            state_id: stateId,
            district_id: districtId,
            indicator: "price"
          })
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("API limit exceeded. Please try again after 1 hour.");
          }
          throw new Error("Failed to fetch markets.");
        }

        const result = await response.json();

        if (result.output?.data) {
          const map = new Map<string, Market>();
          result.output.data.forEach((m: any) => {
            if (!map.has(m.market_name)) {
              map.set(m.market_name, { id: m.market_id, name: m.market_name });
            }
          });
          const finalMarkets = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
          setMarkets(finalMarkets);
          setCached(cacheKey, finalMarkets);
        } else {
          setMarkets([]);
        }
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, [commodityId, stateId, districtId]);

  return { markets, loading, error };
}
