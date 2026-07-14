"use client";

import * as React from "react";
import { getCached, setCached, CACHE_TTL } from "@/lib/api-cache";

export interface GeoLocation { id: number; name: string; }

const CACHE_KEY = "agmarknet_geographies_v1";

interface GeographiesCache {
  states: GeoLocation[];
  districtsByState: Record<string, GeoLocation[]>;
}

export function useGeographies() {
  const [states, setStates] = React.useState<GeoLocation[]>([]);
  const [districtsByState, setDistrictsByState] = React.useState<Record<string, GeoLocation[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchGeographies() {
      const cached = getCached<GeographiesCache>(CACHE_KEY, CACHE_TTL.REFERENCE_DATA);
      if (cached) {
        setStates(cached.states);
        setDistrictsByState(cached.districtsByState);
        setLoading(false);
        return;
      }

      setError(null);
      try {
        const response = await fetch("/api/agmarknet/geographies", {
          method: "GET",
        });

        if (!response.ok) {
          if (response.status === 429 || response.status === 409) {
            throw new Error("API limit exceeded. Please try again after 1 hour.");
          }
          throw new Error("Failed to fetch geographies.");
        }

        const result = await response.json();

        if (result.output?.data) {
          const stateMap = new Map<string, GeoLocation>();
          const distMap: Record<string, Map<string, GeoLocation>> = {};

          result.output.data.forEach((item: any) => {
            const stateName = item.census_state_name;
            const districtName = item.census_district_name;

            if (!stateMap.has(stateName)) {
              stateMap.set(stateName, { id: item.census_state_id, name: stateName });
              distMap[stateName] = new Map();
            }
            if (!distMap[stateName].has(districtName)) {
              distMap[stateName].set(districtName, { id: item.census_district_id, name: districtName });
            }
          });

          const uniqueStates = Array.from(stateMap.values()).sort((a, b) => a.name.localeCompare(b.name));
          const finalDistricts: Record<string, GeoLocation[]> = {};

          uniqueStates.forEach(s => {
            finalDistricts[s.name] = Array.from(distMap[s.name].values()).sort((a, b) => a.name.localeCompare(b.name));
          });

          setStates(uniqueStates);
          setDistrictsByState(finalDistricts);

          setCached<GeographiesCache>(CACHE_KEY, { states: uniqueStates, districtsByState: finalDistricts });
        }
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchGeographies();
  }, []);

  return { states, districtsByState, loading, error };
}
