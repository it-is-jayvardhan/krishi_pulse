"use client";

import * as React from "react";

export interface Commodity { id: number; name: string; }

export function useCommodities() {
  const [commodities, setCommodities] = React.useState<Commodity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCommodities() {
      // 1. Check if we already have this in cache
      const cached = sessionStorage.getItem("cache_commodities");
      if (cached) {
        setCommodities(JSON.parse(cached));
        setLoading(false);
        return; // Skip the API call entirely
      }

      try {
        // Replace lines 21-27 with this:
const response = await fetch("/api/agmarknet/commodities", {
  method: "GET",
});

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
          
          // 2. Save the result to cache for the next reload
          sessionStorage.setItem("cache_commodities", JSON.stringify(finalData));
        }
      } catch (error) {
        console.error("Failed to fetch commodities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCommodities();
  }, []);

  return { commodities, loading };
}