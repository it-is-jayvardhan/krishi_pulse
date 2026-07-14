"use client";

import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, Package } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MarketRecord } from "@/types/market";

interface DayDetailSheetProps {
  record: MarketRecord | null;
  previousRecord: MarketRecord | null;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DayDetailSheet({ record, previousRecord, onClose }: DayDetailSheetProps) {
  // Retain the last non-null record while the dialog is closing so the exit
  // animation doesn't flash empty content.
  const [displayed, setDisplayed] = React.useState<{
    record: MarketRecord;
    previousRecord: MarketRecord | null;
  } | null>(null);

  React.useEffect(() => {
    if (record) setDisplayed({ record, previousRecord });
  }, [record, previousRecord]);

  if (!displayed) return null;

  const diff = displayed.previousRecord
    ? displayed.record.modalPrice - displayed.previousRecord.modalPrice
    : null;
  const trend = diff === null ? "flat" : diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const { record: shown } = displayed;

  const stats: Array<{ label: string; value: string }> = [
    { label: "Minimum Price", value: `₹${shown.minPrice.toLocaleString("en-IN")}` },
    { label: "Maximum Price", value: `₹${shown.maxPrice.toLocaleString("en-IN")}` },
    { label: "Modal Price", value: `₹${shown.modalPrice.toLocaleString("en-IN")}` },
    { label: "Arrival Quantity", value: `${shown.arrivalQuantity.toLocaleString("en-IN")} quintals` },
  ];

  return (
    <Dialog
      open={Boolean(record)}
      onClose={onClose}
      title={`${shown.commodity} · ${formatDate(shown.date)}`}
      description={`${shown.market}, ${shown.state}`}
    >
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 font-[var(--font-jakarta)] text-base font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-border p-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">vs. previous reporting day</span>
        </div>
        {diff === null ? (
          <Badge variant="secondary">No prior data</Badge>
        ) : (
          <Badge
            variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
            className="gap-1"
          >
            {trend === "up" && <ArrowUpRight />}
            {trend === "down" && <ArrowDownRight />}
            {trend === "flat" && <Minus />}
            {diff === 0 ? "No change" : `₹${Math.abs(diff).toLocaleString("en-IN")} ${trend === "up" ? "higher" : "lower"}`}
          </Badge>
        )}
      </div>
    </Dialog>
  );
}
