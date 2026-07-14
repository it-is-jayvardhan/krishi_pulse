"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MarketRecord, PriceTier, TIER_META } from "@/types/market";

interface DayCellProps {
  day: number;
  record?: MarketRecord;
  tier?: PriceTier;
  index: number;
  onSelect?: (record: MarketRecord) => void;
}

export function DayCell({ day, record, tier, index, onSelect }: DayCellProps) {
  const hasData = Boolean(record && tier);

  return (
    <motion.button
      type="button"
      disabled={!hasData}
      onClick={() => record && onSelect?.(record)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.012, 0.4), ease: "easeOut" }}
      whileHover={hasData ? { y: -2 } : undefined}
      className={cn(
        "group/day flex aspect-square w-full flex-col items-start justify-between rounded-lg border border-border/60 p-1.5 text-left transition-shadow sm:rounded-xl sm:p-2.5",
        hasData
          ? "cursor-pointer shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          : "cursor-default bg-muted/30"
      )}
      style={
        hasData && tier
          ? {
              backgroundColor: `hsl(var(${TIER_META[tier].bgVar}))`,
              color: `hsl(var(${TIER_META[tier].fgVar}))`,
            }
          : undefined
      }
    >
      <span className="text-[0.7rem] font-semibold opacity-80 sm:text-xs">{day}</span>
      {hasData && record && (
        <span className="w-full truncate font-[var(--font-jakarta)] text-[0.65rem] font-bold leading-tight sm:text-sm">
          ₹{record.modalPrice.toLocaleString("en-IN")}
        </span>
      )}
    </motion.button>
  );
}
