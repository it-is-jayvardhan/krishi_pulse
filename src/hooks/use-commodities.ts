"use client";

import * as React from "react";
import { getCached, setCached, CACHE_TTL } from "@/lib/api-cache";

export interface Commodity { id: number; name: string; }

const CACHE_KEY = "agmarknet_commodities_v1";

export function useCommodities() {
  const [commodities, setCommodities] = React.useState<Commodity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchCommodities() {
      const cached = getCached<Commodity[]>(CACHE_KEY, CACHE_TTL.REFERENCE_DATA);
      if (cached) {
        setCommodities(cached);
        setLoading(false);
        return;
      }

      setError(null);
      try {
        const response = await fetch("/api/agmarknet/commodities", {
          method: "GET",
        });

        if (!response.ok) {
          if (response.status === 429 || response.status === 409) {
            throw new Error("API limit exceeded. Please try again after 1 hour.");
          }
          throw new Error("Failed to fetch commodities.");
        }

        const result = await response.json();

        if (result.output?.data) {
          const map = new Map<string, Commodity>();
          result.output.data.forEach((item: any) => {
            if (!map.has(item.commodity_name)) {
              map.set(item.commodity_name, { id: item.commodity_id, name: item.commodity_name });
            }
          });

          const finalData = Array.from(map.values());
          setCommodities(finalData);
          setCached(CACHE_KEY, finalData);
        }
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchCommodities();
  }, []);

  return { commodities, loading, error };
}
