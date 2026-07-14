"use client";

import * as React from "react";
import { Navbar } from "@/components/navbar";
import { FilterBar, Filters } from "@/features/filters/filter-bar";
import { useFavorites } from "@/hooks/use-favorites";
import { usePrices } from "@/hooks/use-prices";
import { SummaryCards } from "@/features/summary/summary-cards";
import { CalendarGrid } from "@/features/calendar/calendar-grid";
import { Legend } from "@/features/calendar/legend";
import { DayDetailSheet } from "@/features/calendar/day-detail-sheet";
import { getMonthSummary } from "@/lib/price-tier";
import { MarketRecord } from "@/types/market";

const now = new Date();

export default function Home() {
  const { favorites, toggleFavorite } = useFavorites();

  const [filters, setFilters] = React.useState<Filters>({
    commodity: "", 
    state: "",     
    district: "",  
    market: "",    
    monthIndex: now.getMonth(),
    year: now.getFullYear(),
  });

  const [selectedRecord, setSelectedRecord] = React.useState<MarketRecord | null>(null);

  // 1. Fetch records FIRST
  const { records, loading, error:priceError } = usePrices(
  filters.commodityId,
  filters.stateId,
  filters.districtId,
  filters.marketId,
  filters.monthIndex,
  filters.year,
  filters.commodity,
  filters.state,
  filters.market
);

  // 2. Then calculate summary based on those records
  const summary = React.useMemo(() => getMonthSummary(records), [records]);

  // 3. Calculate previous record for the detail sheet
  const previousRecord = React.useMemo(() => {
    if (!selectedRecord) return null;
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    const idx = sorted.findIndex((r) => r.id === selectedRecord.id);
    return idx > 0 ? sorted[idx - 1] : null;
  }, [records, selectedRecord]);

  // 1. Create a state to catch errors coming from the FilterBar (like the markets API)
  const [filterError, setFilterError] = React.useState<string | null>(null);

  // 2. The final error to display is either the filter error OR the price error
  const displayError = filterError || priceError;

  return (
    <main className="min-h-screen bg-background pb-16">
      <Navbar /> 
      <FilterBar
        value={filters}
        favorites={favorites}
        onApply={setFilters}
        onToggleFavorite={toggleFavorite}
        onError={setFilterError}
      />


      {/* Error Banner */}
{/* 1. Change 'error' to 'displayError' here */}
      {displayError && (
        <div className="section-container my-4">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-bold flex items-center gap-2">
              ⚠️ Attention
            </p>
            {/* 2. Change 'error' to 'displayError' here */}
            <p className="mt-1 opacity-90">{displayError}</p>
          </div>
        </div>
      )}
      
      {/* Show a quick loading state if data is fetching */}
      {loading ? (
        <div className="section-container py-10 text-center text-muted-foreground">
          Loading market data...
        </div>
      // {/* 3. Change '!error' to '!displayError' here */}
      ) : (!displayError && (
        <>
          <SummaryCards summary={summary} />
          
          <div className="section-container">
            <CalendarGrid
              monthIndex={filters.monthIndex}
              year={filters.year}
              records={records}
              summary={summary}
              onSelectDay={setSelectedRecord}
            />
          </div>

          <Legend />
          <DayDetailSheet
            record={selectedRecord}
            previousRecord={previousRecord}
            onClose={() => setSelectedRecord(null)}
          /> 
        </>
      )
      )}

      
    </main>
  );
}