"use client";

import * as React from "react";

export interface Market { id: number; name: string; }

export function useMarkets(commodityId?: number, stateId?: number, districtId?: number) {
  const [markets, setMarkets] = React.useState<Market[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null); // <-- 1. Add error state

  React.useEffect(() => {
    if (!commodityId || !stateId || !districtId) {
      setMarkets([]);
      return;
    }

    async function fetchMarkets() {
      setLoading(true);
      setError(null); // <-- Reset error on new fetch
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

        // <-- 2. Catch the 429 limit exceeded error here
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
          setMarkets(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          setMarkets([]);
        }
      } catch (e: any) {
        // Remove or comment out the console.error line!
        console.error("Failed to fetch markets:", e); 
        
        setError(e.message || "An unexpected error occurred."); 
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, [commodityId, stateId, districtId]);

  return { markets, loading, error }; // <-- 4. Return the error
}