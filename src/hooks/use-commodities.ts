"use client";

import * as React from "react";

export interface Commodity { id: number; name: string; }

export function useCommodities() {
  const [commodities, setCommodities] = React.useState<Commodity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null); // <-- 1. Add error state

  React.useEffect(() => {
    async function fetchCommodities() {
      const cached = sessionStorage.getItem("cache_commodities");
      if (cached) {
        setCommodities(JSON.parse(cached));
        setLoading(false);
        return;
      }

      setError(null);
      try {
        const response = await fetch("/api/agmarknet/commodities", {
          method: "GET",
        });

        // <-- 2. Catch the API limit error here
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
          sessionStorage.setItem("cache_commodities", JSON.stringify(finalData));
        }
      } catch (e: any) {
        // No console.error here so the red screen doesn't pop up!
        setError(e.message || "An unexpected error occurred."); // <-- 3. Save error
      } finally {
        setLoading(false);
      }
    }

    fetchCommodities();
  }, []);

  return { commodities, loading, error }; // <-- 4. Return error
}