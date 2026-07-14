"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { FilterBar, Filters } from "@/features/filters/filter-bar";
import { useFavorites } from "@/hooks/use-favorites";
import { usePrices } from "@/hooks/use-prices";
import { CalendarSection } from "@/features/calendar/calendar-section";
import { DayDetailSheet } from "@/features/calendar/day-detail-sheet";
import { MarketRecord } from "@/types/market";
import { cn } from "@/lib/utils";

const now = new Date();

export default function Home() {
  const { favorites, toggleFavorite } = useFavorites();

  const [filters, setFilters] = React.useState<Filters>({
    commodity: "",
    state: "",
    district: "",
    market: "",
    startMonthIndex: now.getMonth(),
    startYear: now.getFullYear(),
    endMonthIndex: now.getMonth(),
    endYear: now.getFullYear(),
  });

  // Only true once "Load" has been pressed at least once - controls
  // whether the filter bar or the calendar is visible.
  const [submitted, setSubmitted] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<MarketRecord | null>(null);

  const { records, loading, error: priceError } = usePrices(
    filters.commodityId,
    filters.stateId,
    filters.districtId,
    filters.marketId,
    filters.startMonthIndex,
    filters.startYear,
    filters.endMonthIndex,
    filters.endYear,
    filters.commodity,
    filters.state,
    filters.market
  );

  const previousRecord = React.useMemo(() => {
    if (!selectedRecord) return null;
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    const idx = sorted.findIndex((r) => r.id === selectedRecord.id);
    return idx > 0 ? sorted[idx - 1] : null;
  }, [records, selectedRecord]);

  const [filterError, setFilterError] = React.useState<string | null>(null);
  const displayError = filterError || priceError;

  return (
    <main className="min-h-screen bg-background pb-16">
      <Navbar />

      {/* Filter bar stays mounted (so its in-progress selections aren't lost)
          but is hidden once the user has loaded a calendar. */}
      <div className={cn(submitted && "hidden")}>
        <FilterBar
          value={filters}
          favorites={favorites}
          onApply={(next) => {
            setFilters(next);
            setSubmitted(true);
          }}
          onToggleFavorite={toggleFavorite}
          onError={setFilterError}
        />
      </div>

      {submitted && (
        <div className="section-container flex justify-start py-3">
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            <SlidersHorizontal />
            Change Filters
          </Button>
        </div>
      )}

      {displayError && (
        <div className="section-container my-4">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-bold flex items-center gap-2">
              ⚠️ Attention
            </p>
            <p className="mt-1 opacity-90">{displayError}</p>
          </div>
        </div>
      )}

      {submitted && (
        loading ? (
          <div className="section-container py-10 text-center text-muted-foreground">
            Loading market data...
          </div>
        ) : (
          !displayError && (
            <CalendarSection
              records={records}
              startMonthIndex={filters.startMonthIndex}
              startYear={filters.startYear}
              endMonthIndex={filters.endMonthIndex}
              endYear={filters.endYear}
              onSelectDay={setSelectedRecord}
            />
          )
        )
      )}

      <DayDetailSheet
        record={selectedRecord}
        previousRecord={previousRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </main>
  );
}
