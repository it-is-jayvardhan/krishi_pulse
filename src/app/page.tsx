"use client";

import * as React from "react";
import { TrendingDown, TrendingUp, Minus, Settings2, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { usePreferences } from "@/lib/preferences";
import { saveTodayDataToHistory, getPreviousMarketData } from "@/lib/price-history";
import { MandiRecord } from "@/types/mandi";
import { MANDI_STATES, MANDI_COMMODITIES } from "@/lib/constants";

export default function Home() {
  const { prefs, savePrefs, clearPrefs, isReady } = usePreferences();
  
  const [formState, setFormState] = React.useState("");
  const [formCommodity, setFormCommodity] = React.useState("");
  
  const [records, setRecords] = React.useState<MandiRecord[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pagination state: tracks how many records to visibly display
  const [visibleCount, setVisibleCount] = React.useState(10);

  // Re-run data fetch whenever the saved preferences change
  React.useEffect(() => {
    if (!prefs) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      setRecords([]); 
      setVisibleCount(10); // Reset the pagination limit back to 10 on a new search

      try {
        // Appending &limit=50 to the endpoint securely retrieves a robust initial batch
        const url = `/api/agmarknet/current?state=${encodeURIComponent(prefs!.state)}&commodity=${encodeURIComponent(prefs!.commodity)}&limit=50`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error("Failed to load today's market data.");
        
        const json = await res.json();
        
        if (json.records) {
          setRecords(json.records);
          saveTodayDataToHistory(json.records);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [prefs]);

  // Sync internal form state if preferences change or exist
  React.useEffect(() => {
    if (prefs) {
      setFormState(prefs.state);
      setFormCommodity(prefs.commodity);
    }
  }, [prefs]);

  if (!isReady) {
    return <div className="min-h-screen bg-background" />;
  }

  // View 1: Initial Preference Setup (Only shown on very first visit)
  if (!prefs) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="section-container mt-10 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to KrishiPulse</CardTitle>
              <CardDescription>Select your primary market focus to get started.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">State</label>
                <SearchableSelect
                  options={MANDI_STATES.map(s => ({ label: s, value: s }))}
                  value={formState}
                  onChange={setFormState}
                  placeholder="Select State"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Commodity</label>
                <SearchableSelect
                  options={MANDI_COMMODITIES.map(c => ({ label: c, value: c }))}
                  value={formCommodity}
                  onChange={setFormCommodity}
                  placeholder="Select Commodity"
                />
              </div>
              <Button 
                className="mt-2 w-full" 
                onClick={() => savePrefs(formState, formCommodity)}
                disabled={!formState || !formCommodity}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Slice the downloaded array to strictly show the current page chunk
  const displayedRecords = records.slice(0, visibleCount);
  const hasMore = records.length > visibleCount;

  // View 2: Persistent Dashboard
  return (
    <main className="min-h-screen bg-background pb-16">
      <Navbar />
      
      {/* Persistent Selector Bar */}
      <div className="border-b border-border bg-card shadow-sm  z-40">
        <div className="section-container flex flex-col gap-3 py-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">State</label>
            <SearchableSelect
              options={MANDI_STATES.map(s => ({ label: s, value: s }))}
              value={formState}
              onChange={setFormState}
              placeholder="Select State"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Commodity</label>
            <SearchableSelect
              options={MANDI_COMMODITIES.map(c => ({ label: c, value: c }))}
              value={formCommodity}
              onChange={setFormCommodity}
              placeholder="Select Commodity"
            />
          </div>
          <Button 
            className="sm:w-32" 
            onClick={() => savePrefs(formState, formCommodity)}
            disabled={loading || !formState || !formCommodity}
          >
            Update Live
          </Button>
        </div>
      </div>

      {/* Dynamic Status States */}
      {loading && (
        <div className="section-container py-16 text-center text-muted-foreground font-medium">
          Fetching live market data...
        </div>
      )}

      {error && (
        <div className="section-container mt-6">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="section-container py-16 text-center text-muted-foreground">
          No market arrivals reported for <span className="font-semibold text-foreground">{prefs.commodity}</span> in <span className="font-semibold text-foreground">{prefs.state}</span> today.
        </div>
      )}

      {/* Main Results Grid */}
      {!loading && records.length > 0 && (
        <>
          <div className="section-container mt-4 mb-2 flex justify-between items-center text-xs text-muted-foreground font-medium">
            <span>Showing {displayedRecords.length} of {records.length} markets found</span>
          </div>

          <div className="section-container grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedRecords.map((record, i) => {
              const previous = getPreviousMarketData(record);
              
              let diff = null;
              let trend: "up" | "down" | "flat" = "flat";

              if (previous) {
                diff = record.modalPrice - previous.modalPrice;
                trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
              }

              const formattedDate = new Date(record.arrivalDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              });

              return (
                <Card key={`${record.market}-${i}`} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-primary">{record.market} Mandi</CardTitle>
                        <CardDescription className="mt-1 text-sm">
                          {record.district}, {record.state}
                        </CardDescription>
                      </div>
                      {previous && (
                        <Badge
                          variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
                          className="shrink-0 gap-1 px-2 py-1"
                        >
                          {trend === "up" && <TrendingUp className="h-3 w-3" />}
                          {trend === "down" && <TrendingDown className="h-3 w-3" />}
                          {trend === "flat" && <Minus className="h-3 w-3" />}
                          {diff === 0 ? "Flat" : `₹${Math.abs(diff!)}`}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="mt-4 flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 rounded-lg bg-muted/40 p-3 text-sm border border-border/50">
                      <div>
                        <span className="text-xs font-semibold uppercase text-muted-foreground block mb-0.5">Commodity</span>
                        <span className="font-medium text-foreground">{record.commodity}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase text-muted-foreground block mb-0.5">Variety</span>
                        <span className="font-medium text-foreground">{record.variety}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase text-muted-foreground block mb-0.5">Grade</span>
                        <span className="font-medium text-foreground">{record.grade}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase text-muted-foreground block mb-0.5">Arrival Date</span>
                        <span className="font-medium text-foreground">{formattedDate}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Standard (Modal) Price</p>
                      <p className="font-[var(--font-jakarta)] text-3xl font-extrabold text-foreground">
                        ₹{record.modalPrice.toLocaleString("en-IN")}
                        <span className="text-base font-medium text-muted-foreground"> / quintal</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg bg-muted/60 p-3 text-sm border border-border/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Minimum Price</span>
                        <span className="font-bold text-foreground text-base">₹{record.minPrice.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-8 w-px bg-border/80" />
                      <div className="flex flex-col text-right">
                        <span className="text-xs text-muted-foreground">Maximum Price</span>
                        <span className="font-bold text-foreground text-base">₹{record.maxPrice.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Load More Button Container */}
          {hasMore && (
            <div className="section-container mt-8 flex justify-center">
              <Button 
                variant="outline" 
                className="w-full max-w-xs gap-2 border-primary/30 hover:bg-primary/5 text-primary"
                onClick={() => setVisibleCount(prev => prev + 10)}
              >
                <ChevronDown className="h-4 w-4" />
                Load More Markets ({records.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}