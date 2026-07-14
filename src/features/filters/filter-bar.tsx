"use client";

import * as React from "react";
import { Wheat, Map, MapPin, Store, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCommodities } from "@/hooks/use-commodities";
import { useGeographies } from "@/hooks/use-geographies";
import { useMarkets } from "@/hooks/use-markets";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MonthRangePicker } from "@/components/ui/month-range-picker";

export interface Filters {
  commodity: string;
  commodityId?: number;
  state: string;
  stateId?: number;
  district: string;
  districtId?: number;
  market: string;
  marketId?: number;
  startMonthIndex: number;
  startYear: number;
  endMonthIndex: number;
  endYear: number;
}

interface FilterBarProps {
  value: Filters;
  favorites: string[];
  onApply: (filters: Filters) => void;
  onToggleFavorite: (commodity: string) => void;
  onError: (errorMsg: string | null) => void;
}

export function FilterBar({ value, favorites, onApply, onToggleFavorite, onError }: FilterBarProps) {
  const [pending, setPending] = React.useState<Filters>(value);

  const { commodities, loading: commLoading, error: commError } = useCommodities();
  const { states, districtsByState, loading: geoLoading, error: geoError } = useGeographies();

  const isBaseLoading = commLoading || geoLoading;

  // Find the selected IDs based on the string names stored in state
  const selectedCommodityId = commodities.find(c => c.name === pending.commodity)?.id;
  const selectedStateId = states.find(s => s.name === pending.state)?.id;
  const selectedDistrictId = (districtsByState[pending.state] || []).find(d => d.name === pending.district)?.id;
  const { markets, loading: marketsLoading, error: marketError } = useMarkets(selectedCommodityId, selectedStateId, selectedDistrictId);

  // Set default items once the initial APIs load
  React.useEffect(() => {
    if (!isBaseLoading) {
      setPending((p) => {
        const updated = { ...p };
        if (commodities.length > 0 && !p.commodity) {
          updated.commodity = commodities[0].name;
        }
        if (states.length > 0 && !p.state) {
          updated.state = states[0].name;
          updated.district = districtsByState[states[0].name]?.[0]?.name || "";
          updated.market = ""; // Clear market out until it finishes loading
        }
        return updated;
      });
    }
  }, [isBaseLoading, commodities, states, districtsByState]);

  // Set/preserve the selected market once the Markets API finishes fetching.
  // Only falls back to the first market if the currently pending market
  // isn't actually in the new list - otherwise a user's manual pick would
  // get silently overwritten every time this list refetches.
  React.useEffect(() => {
    if (marketsLoading) return;

    setPending((p) => {
      if (markets.length === 0) {
        return p.market === "" ? p : { ...p, market: "" };
      }
      const stillValid = markets.some((m) => m.name === p.market);
      if (stillValid) return p;
      return { ...p, market: markets[0].name };
    });
  }, [marketsLoading, markets]);

  const districtsForState = districtsByState[pending.state] ?? [];

  // Handlers to cascade dropdown resets down the chain
  function updateState(stateName: string) {
    const firstDistrict = districtsByState[stateName]?.[0]?.name ?? "";
    setPending(p => ({ ...p, state: stateName, district: firstDistrict, market: "" }));
  }

  function updateDistrict(districtName: string) {
    setPending(p => ({ ...p, district: districtName, market: "" }));
  }

  // Watch for any error across all APIs and send the first one it finds up to page.tsx
  React.useEffect(() => {
    const combinedError = commError || geoError || marketError;
    if (combinedError) {
      onError(combinedError);
    } else {
      onError(null);
    }
  }, [commError, geoError, marketError, onError]);

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="section-container flex flex-wrap items-center gap-2 py-3">
        <div className="flex w-full items-center gap-1 sm:w-auto">
          <SearchableSelect
            icon={<Wheat />}
            value={pending.commodity || ""}
            onChange={(commodity) => setPending((p) => ({ ...p, commodity }))}
            options={
              commLoading
                ? [{ label: "Loading...", value: "" }]
                : commodities.map((c) => ({
                    label: favorites.includes(c.name) ? `\u2605 ${c.name}` : c.name,
                    value: c.name,
                  }))
            }
            className="w-full sm:w-44"
            placeholder="Select Commodity"
            disabled={commLoading}
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle favorite"
            onClick={() => onToggleFavorite(pending.commodity)}
            disabled={commLoading || !pending.commodity}
          >
            <Star
              className={cn(favorites.includes(pending.commodity) && "fill-primary text-primary")}
            />
          </Button>
        </div>

        <SearchableSelect
          icon={<Map />}
          value={pending.state || ""}
          onChange={updateState}
          options={
            geoLoading
              ? [{ label: "Loading...", value: "" }]
              : states.map((s) => ({ label: s.name, value: s.name }))
          }
          className="w-full sm:w-36"
          placeholder="Select State"
          disabled={geoLoading}
        />

        <SearchableSelect
          icon={<MapPin />}
          value={pending.district || ""}
          onChange={updateDistrict}
          options={
            geoLoading
              ? [{ label: "Loading...", value: "" }]
              : districtsForState.map((d) => ({ label: d.name, value: d.name }))
          }
          className="w-full sm:w-40"
          placeholder="Select District"
          disabled={geoLoading || districtsForState.length === 0}
        />

        <SearchableSelect
          icon={<Store />}
          value={pending.market || ""}
          onChange={(market) => setPending((p) => ({ ...p, market }))}
          options={
            marketsLoading
              ? [{ label: "Loading...", value: "" }]
              : markets.length > 0
                ? markets.map((m: { id: number; name: string }) => ({ label: m.name, value: m.name }))
                : [{ label: "No Markets", value: "" }]
          }
          className="w-full sm:w-40"
          placeholder="Select Market"
          disabled={marketsLoading || markets.length === 0}
        />

        <MonthRangePicker
          start={{ monthIndex: pending.startMonthIndex, year: pending.startYear }}
          end={{ monthIndex: pending.endMonthIndex, year: pending.endYear }}
          onChange={(start, end) =>
            setPending((p) => ({
              ...p,
              startMonthIndex: start.monthIndex,
              startYear: start.year,
              endMonthIndex: end.monthIndex,
              endYear: end.year,
            }))
          }
          className="w-full sm:w-44"
        />

        <Button
          onClick={() => {
            const marketId = markets.find((m: { id: number; name: string }) => m.name === pending.market)?.id;
            onApply({
              ...pending,
              commodityId: selectedCommodityId,
              stateId: selectedStateId,
              districtId: selectedDistrictId,
              marketId: marketId
            });
          }}
          className="ml-auto w-full sm:w-auto"
          disabled={isBaseLoading}
        >
          Load
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
