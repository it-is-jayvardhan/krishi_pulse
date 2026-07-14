"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "./calendar-grid";
import { Legend } from "./legend";
import { SummaryCards } from "@/features/summary/summary-cards";
import { MarketRecord } from "@/types/market";
import { getMonthSummary } from "@/lib/price-tier";
import { enumerateMonths, formatMonthYear } from "@/lib/date-range";

interface CalendarSectionProps {
  records: MarketRecord[];
  startMonthIndex: number;
  startYear: number;
  endMonthIndex: number;
  endYear: number;
  onSelectDay: (record: MarketRecord) => void;
}

/**
 * Renders one month at a time from an already-fetched multi-month range.
 * The prev/next arrows only page through data already in memory - they
 * never trigger another API call.
 */
export function CalendarSection({
  records,
  startMonthIndex,
  startYear,
  endMonthIndex,
  endYear,
  onSelectDay,
}: CalendarSectionProps) {
  const months = React.useMemo(
    () => enumerateMonths(startMonthIndex, startYear, endMonthIndex, endYear),
    [startMonthIndex, startYear, endMonthIndex, endYear]
  );

  const [activeIndex, setActiveIndex] = React.useState(0);

  // A fresh "Load" always lands back on the first month of the new range.
  React.useEffect(() => {
    setActiveIndex(0);
  }, [startMonthIndex, startYear, endMonthIndex, endYear]);

  const clampedIndex = Math.min(activeIndex, months.length - 1);
  const active = months[clampedIndex];

  const activeRecords = React.useMemo(() => {
    if (!active) return [];
    return records.filter((r) => {
      const [y, m] = r.date.split("-").map(Number);
      return y === active.year && m - 1 === active.monthIndex;
    });
  }, [records, active]);

  const summary = React.useMemo(() => getMonthSummary(activeRecords), [activeRecords]);

  if (!active) return null;

  return (
    <div>
      <div className="section-container flex items-center justify-between gap-3 py-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          disabled={clampedIndex === 0}
        >
          <ChevronLeft />
        </Button>

        <div className="text-center">
          <h2 className="font-[var(--font-jakarta)] text-lg font-bold sm:text-xl">
            {formatMonthYear(active.monthIndex, active.year)}
          </h2>
          {months.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Month {clampedIndex + 1} of {months.length}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          aria-label="Next month"
          onClick={() => setActiveIndex((i) => Math.min(months.length - 1, i + 1))}
          disabled={clampedIndex === months.length - 1}
        >
          <ChevronRight />
        </Button>
      </div>

      <SummaryCards summary={summary} />

      <div className="section-container">
        <CalendarGrid
          monthIndex={active.monthIndex}
          year={active.year}
          records={activeRecords}
          summary={summary}
          onSelectDay={onSelectDay}
        />
      </div>

      <Legend />
    </div>
  );
}
