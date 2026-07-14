"use client";

import * as React from "react";

export interface GeoLocation { id: number; name: string; }

export function useGeographies() {
  const [states, setStates] = React.useState<GeoLocation[]>([]);
  const [districtsByState, setDistrictsByState] = React.useState<Record<string, GeoLocation[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null); // <-- 1. Add error state

  React.useEffect(() => {
    async function fetchGeographies() {
      const cachedStates = sessionStorage.getItem("cache_states");
      const cachedDistricts = sessionStorage.getItem("cache_districts");
      if (cachedStates && cachedDistricts) {
        setStates(JSON.parse(cachedStates));
        setDistrictsByState(JSON.parse(cachedDistricts));
        setLoading(false);
        return; 
      }

      setError(null);
      try {
        const response = await fetch("/api/agmarknet/geographies", {
          method: "GET",
        });

        // <-- 2. Catch the API limit error here
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

          // 2. Save both sets of data to the cache
          sessionStorage.setItem("cache_states", JSON.stringify(uniqueStates));
          sessionStorage.setItem("cache_districts", JSON.stringify(finalDistricts));
        }
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred."); // <-- 3. Save error
      } finally {
        setLoading(false);
      }
    }

    fetchGeographies();
  }, []);

  return { states, districtsByState, loading, error }; // <-- 4. Return error
}