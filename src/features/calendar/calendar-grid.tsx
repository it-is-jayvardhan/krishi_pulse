"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { DayCell } from "./day-cell";
import { MarketRecord, MonthSummary } from "@/types/market";
import { getPriceTier } from "@/lib/price-tier";
import { MONTHS } from "@/lib/constants";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarGridProps {
  monthIndex: number;
  year: number;
  records: MarketRecord[];
  summary: MonthSummary;
  onSelectDay: (record: MarketRecord) => void;
  compact?: boolean;
}

export function CalendarGrid({
  monthIndex,
  year,
  records,
  summary,
  onSelectDay,
  compact = false,
}: CalendarGridProps) {
  const recordsByDay = React.useMemo(() => {
    const map = new Map<number, MarketRecord>();
    for (const r of records) {
      const day = Number(r.date.slice(-2));
      map.set(day, r);
    }
    return map;
  }, [records]);

  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();

  const cells = React.useMemo(() => {
    const arr: Array<{ day: number | null }> = [];
    for (let i = 0; i < firstWeekday; i++) arr.push({ day: null });
    for (let d = 1; d <= totalDays; d++) arr.push({ day: d });
    return arr;
  }, [firstWeekday, totalDays]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl bg-card p-3 ring-1 ring-foreground/10 sm:p-5"
    >
      {!compact && (
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-[var(--font-jakarta)] text-xl font-bold sm:text-2xl">
            {MONTHS[monthIndex]} {year}
          </h2>
          <span className="text-sm text-muted-foreground">
            {summary.count} reporting {summary.count === 1 ? "day" : "days"}
          </span>
        </div>
      )}
      {compact && (
        <h3 className="mb-3 font-[var(--font-jakarta)] text-base font-semibold">
          {MONTHS[monthIndex]} {year}
        </h3>
      )}

      <div className="mb-1.5 grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="text-center text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
            {compact ? w.slice(0, 1) : w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((cell, i) =>
          cell.day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <DayCell
              key={cell.day}
              day={cell.day}
              index={i}
              record={recordsByDay.get(cell.day)}
              tier={
                recordsByDay.has(cell.day)
                  ? getPriceTier(recordsByDay.get(cell.day)!.modalPrice, summary.lowest, summary.highest)
                  : undefined
              }
              onSelect={onSelectDay}
            />
          )
        )}
      </div>
    </motion.div>
  );
}
