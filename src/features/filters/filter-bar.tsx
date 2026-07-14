"use client";

import * as React from "react";
import { Wheat, Map, MapPin, Store, CalendarDays, ArrowRight, Star } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MONTHS, YEARS } from "@/lib/constants";
import { useCommodities } from "@/hooks/use-commodities";
import { useGeographies } from "@/hooks/use-geographies";
import { useMarkets } from "@/hooks/use-markets"; // <-- Import markets hook
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface Filters {
  commodity: string;
  commodityId?: number;
  state: string;
  stateId?: number;
  district: string;
  districtId?: number;
  market: string;
  marketId?: number;
  monthIndex: number;
  year: number;
}

interface FilterBarProps {
  value: Filters;
  favorites: string[];
  onApply: (filters: Filters) => void;
  onToggleFavorite: (commodity: string) => void;
  onError: (errorMsg: string | null) => void; // <-- Add this
}

export function FilterBar({ value, favorites, onApply, onToggleFavorite, onError }: FilterBarProps) {
  const [pending, setPending] = React.useState<Filters>(value);
  
  const { commodities, loading: commLoading } = useCommodities();
  const { states, districtsByState, loading: geoLoading } = useGeographies();

  
  // Find the selected IDs based on the string names stored in state
  const selectedCommodityId = commodities.find(c => c.name === pending.commodity)?.id;
  const selectedStateId = states.find(s => s.name === pending.state)?.id;
  const selectedDistrictId = (districtsByState[pending.state] || []).find(d => d.name === pending.district)?.id;

  // Fetch dynamic markets based on the selected IDs above
  // const { markets, loading: marketsLoading } = useMarkets(selectedCommodityId, selectedStateId, selectedDistrictId);
  
  const isBaseLoading = commLoading || geoLoading;
  // / 2. Extract the error from useMarkets
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

  

  // Set default Market once the Markets API finishes fetching
  React.useEffect(() => {
    if (!marketsLoading && markets.length > 0) {
      setPending(p => ({ ...p, market: markets[0].name }));
    } else if (!marketsLoading && markets.length === 0) {
      setPending(p => ({ ...p, market: "" }));
    }
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

  // 3. Watch for the error and send it up to page.tsx
  React.useEffect(() => {
    if (marketError) {
      onError(marketError);
    } else {
      onError(null);
    }
  }, [marketError, onError]);

  return (
    <div className=" top-16 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="section-container flex flex-wrap items-center gap-2 py-3">
        <div className="flex w-full items-center gap-1 sm:w-auto">
          {/* Replaced Select with SearchableSelect */}
          <SearchableSelect
            icon={<Wheat />}
            value={pending.commodity || ""}
            onChange={(commodity) => setPending((p) => ({ ...p, commodity }))}
            options={
              commLoading
                ? [{ label: "Loading...", value: "" }]
                : commodities.map((c) => ({
                    label: favorites.includes(c.name) ? `★ ${c.name}` : c.name,
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
        
        {/* Replaced Select with SearchableSelect */}
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
        
        {/* Replaced Select with SearchableSelect */}
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

        {/* Replaced Select with SearchableSelect */}
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

        {/* Kept standard Select for Month and Year */}
        <Select
          icon={<CalendarDays />}
          value={String(pending.monthIndex)}
          onChange={(v) => setPending((p) => ({ ...p, monthIndex: Number(v) }))}
          options={MONTHS.map((m, i) => ({ label: m, value: String(i) }))}
          className="w-full sm:w-36"
          aria-label="Month"
        />
        
        <Select
          value={String(pending.year)}
          onChange={(v) => setPending((p) => ({ ...p, year: Number(v) }))}
          options={YEARS.map((y) => ({ label: String(y), value: String(y) }))}
          className="w-full sm:w-24"
          aria-label="Year"
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