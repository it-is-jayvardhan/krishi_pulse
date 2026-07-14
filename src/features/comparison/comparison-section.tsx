"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarGrid } from "@/features/calendar/calendar-grid";
import { getMonthlyRecords } from "@/services/mock-data";
import { getMonthSummary } from "@/lib/price-tier";
import { MONTHS, YEARS } from "@/lib/constants";
import { MarketRecord } from "@/types/market";

interface ComparisonSectionProps {
  commodity: string;
  state: string;
  market: string;
  onSelectDay: (record: MarketRecord) => void;
}

interface Period {
  monthIndex: number;
  year: number;
}

function pctChange(from: number, to: number) {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

export function ComparisonSection({ commodity, state, market, onSelectDay }: ComparisonSectionProps) {
  const now = new Date();
  const [left, setLeft] = React.useState<Period>({ monthIndex: now.getMonth(), year: now.getFullYear() - 1 });
  const [right, setRight] = React.useState<Period>({ monthIndex: now.getMonth(), year: now.getFullYear() });

  const leftRecords = React.useMemo(
    () => getMonthlyRecords(commodity, state, market, left.monthIndex, left.year),
    [commodity, state, market, left]
  );
  const rightRecords = React.useMemo(
    () => getMonthlyRecords(commodity, state, market, right.monthIndex, right.year),
    [commodity, state, market, right]
  );

  const leftSummary = getMonthSummary(leftRecords);
  const rightSummary = getMonthSummary(rightRecords);

  const rows = [
    { label: "Average", left: leftSummary.average, right: rightSummary.average },
    { label: "Highest", left: leftSummary.highest, right: rightSummary.highest },
    { label: "Lowest", left: leftSummary.lowest, right: rightSummary.lowest },
  ];

  return (
    <section className="section-container py-10">
      <div className="mb-5 flex items-center gap-2">
        <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-[var(--font-jakarta)] text-xl font-bold sm:text-2xl">Compare Months</h2>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PeriodPicker period={left} onChange={setLeft} />
        <PeriodPicker period={right} onChange={setRight} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <CalendarGrid
          monthIndex={left.monthIndex}
          year={left.year}
          records={leftRecords}
          summary={leftSummary}
          onSelectDay={onSelectDay}
          compact
        />
        <CalendarGrid
          monthIndex={right.monthIndex}
          year={right.year}
          records={rightRecords}
          summary={rightSummary}
          onSelectDay={onSelectDay}
          compact
        />
      </motion.div>

      <Card className="mt-4">
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <span className="font-medium text-muted-foreground">Metric</span>
            <span className="font-medium text-muted-foreground">
              {MONTHS[left.monthIndex]} {left.year}
            </span>
            <span className="font-medium text-muted-foreground">
              {MONTHS[right.monthIndex]} {right.year}
            </span>
            <span className="font-medium text-muted-foreground">Difference</span>

            {rows.map((row) => {
              const change = pctChange(row.left, row.right);
              return (
                <React.Fragment key={row.label}>
                  <span className="py-1.5">{row.label}</span>
                  <span className="py-1.5">₹{row.left.toLocaleString("en-IN")}</span>
                  <span className="py-1.5">₹{row.right.toLocaleString("en-IN")}</span>
                  <span className={`py-1.5 font-semibold ${change > 0 ? "text-emerald-600" : change < 0 ? "text-destructive" : ""}`}>
                    {change > 0 ? "+" : ""}
                    {change.toFixed(1)}%
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function PeriodPicker({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-2">
      <Select
        value={String(period.monthIndex)}
        onChange={(v) => onChange({ ...period, monthIndex: Number(v) })}
        options={MONTHS.map((m, i) => ({ label: m, value: String(i) }))}
        className="w-full"
        aria-label="Comparison month"
      />
      <Select
        value={String(period.year)}
        onChange={(v) => onChange({ ...period, year: Number(v) })}
        options={YEARS.map((y) => ({ label: String(y), value: String(y) }))}
        className="w-28"
        aria-label="Comparison year"
      />
    </div>
  );
}
