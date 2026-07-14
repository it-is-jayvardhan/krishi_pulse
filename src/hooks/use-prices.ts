"use client";

import * as React from "react";
import { MarketRecord } from "@/types/market";

export function usePrices(
  commodityId?: number,
  stateId?: number,
  districtId?: number,
  marketId?: number,
  monthIndex?: number,
  year?: number,
  commodityName: string = "",
  stateName: string = "",
  marketName: string = ""
){
  const [records, setRecords] = React.useState<MarketRecord[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null); // <-- Add error state

  React.useEffect(() => {
    if (!commodityId || !stateId || !districtId || !marketId || monthIndex === undefined || !year) {
      setRecords([]);
      return;
    }

    async function fetchPrices() {
      setLoading(true);
      setError(null); // Reset error on new fetch
      try {
        const fromDate = `${year!}-${String(monthIndex! + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year!, monthIndex! + 1, 0).getDate();
        const toDate = `${year!}-${String(monthIndex! + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        
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

        // Check if either of the responses failed
        if (!pricesRes.ok || !quantitiesRes.ok) {
          const failedRes = !pricesRes.ok ? pricesRes : quantitiesRes;
          const errorBody = await failedRes.json();
          
          // Handle the rate limit check
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
          
          setRecords(mapped.sort((a, b) => a.date.localeCompare(b.date)));
        } else {
          setRecords([]);
        }
      } catch (e: any) {
        console.error("Failed to fetch historical market data:", e);
        setError(e.message || "An unexpected error occurred."); // <-- Save error text
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [commodityId, stateId, districtId, marketId, monthIndex, year]);

  return { records, loading, error }; // <-- Return error state
}