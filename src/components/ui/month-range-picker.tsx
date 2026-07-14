"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MIN_YEAR, MAX_YEAR } from "@/lib/constants";
import {
  MonthYear,
  monthsBetween,
  formatMonthYearShort,
  MAX_RANGE_MONTHS,
} from "@/lib/date-range";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface MonthRangePickerProps {
  start: MonthYear;
  end: MonthYear;
  onChange: (start: MonthYear, end: MonthYear) => void;
  className?: string;
}

function isBefore(a: MonthYear, b: MonthYear) {
  return a.year < b.year || (a.year === b.year && a.monthIndex < b.monthIndex);
}

function isSame(a: MonthYear, b: MonthYear) {
  return a.year === b.year && a.monthIndex === b.monthIndex;
}

function isWithin(candidate: MonthYear, start: MonthYear, end: MonthYear) {
  return !isBefore(candidate, start) && !isBefore(end, candidate);
}

/**
 * A themed popover for picking a month range: click a month to set the
 * start, click another (or the same one again) to set the end. Matches
 * the app's Select/SearchableSelect trigger styling so it drops in
 * alongside the rest of the filter bar.
 */
export function MonthRangePicker({ start, end, onChange, className }: MonthRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState(end.year);
  const [draftStart, setDraftStart] = React.useState<MonthYear | null>(null);
  const [rangeError, setRangeError] = React.useState<string | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setDraftStart(null);
        setRangeError(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMonthClick(monthIndex: number) {
    const clicked: MonthYear = { monthIndex, year: pickerYear };

    if (!draftStart) {
      setDraftStart(clicked);
      setRangeError(null);
      return;
    }

    const [newStart, newEnd] = isBefore(clicked, draftStart)
      ? [clicked, draftStart]
      : [draftStart, clicked];

    if (monthsBetween(newStart.monthIndex, newStart.year, newEnd.monthIndex, newEnd.year) > MAX_RANGE_MONTHS) {
      setRangeError(`Pick a range of ${MAX_RANGE_MONTHS} months or fewer.`);
      setDraftStart(null);
      return;
    }

    onChange(newStart, newEnd);
    setDraftStart(null);
    setRangeError(null);
    setOpen(false);
  }

  const label = isSame(start, end)
    ? formatMonthYearShort(start.monthIndex, start.year)
    : `${formatMonthYearShort(start.monthIndex, start.year)} \u2013 ${formatMonthYearShort(end.monthIndex, end.year)}`;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setPickerYear(end.year);
          setOpen((o) => !o);
        }}
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="w-full truncate text-left">{label}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-border bg-card p-3 text-card-foreground shadow-lg ring-1 ring-foreground/10">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous year"
              onClick={() => setPickerYear((y) => Math.max(MIN_YEAR, y - 1))}
              disabled={pickerYear <= MIN_YEAR}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">{pickerYear}</span>
            <button
              type="button"
              aria-label="Next year"
              onClick={() => setPickerYear((y) => Math.min(MAX_YEAR, y + 1))}
              disabled={pickerYear >= MAX_YEAR}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-2 text-xs text-muted-foreground">
            {draftStart
              ? `Pick an end month (start: ${formatMonthYearShort(draftStart.monthIndex, draftStart.year)})`
              : "Pick a start month"}
          </p>

          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_SHORT.map((monthLabel, monthIndex) => {
              const candidate: MonthYear = { monthIndex, year: pickerYear };
              const isEndpoint =
                isSame(candidate, start) ||
                isSame(candidate, end) ||
                (draftStart !== null && isSame(candidate, draftStart));
              const inRange = !draftStart && isWithin(candidate, start, end);

              return (
                <button
                  key={monthIndex}
                  type="button"
                  onClick={() => handleMonthClick(monthIndex)}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isEndpoint && "bg-primary text-primary-foreground hover:bg-primary/90",
                    inRange && !isEndpoint && "bg-primary/10 text-primary"
                  )}
                >
                  {monthLabel}
                </button>
              );
            })}
          </div>

          {rangeError && <p className="mt-2 text-xs text-destructive">{rangeError}</p>}
        </div>
      )}
    </div>
  );
}
