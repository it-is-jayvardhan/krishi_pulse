import { TIER_META } from "@/types/market";

const ORDER = ["highest", "good", "average", "below", "lowest"] as const;

export function Legend() {
  return (
    <div className="section-container flex flex-wrap items-center gap-x-5 gap-y-2 py-5 text-sm text-muted-foreground">
      {ORDER.map((tier) => (
        <span key={tier} className="flex items-center gap-1.5">
          <span aria-hidden>{TIER_META[tier].emoji}</span>
          {TIER_META[tier].label}
        </span>
      ))}
    </div>
  );
}
