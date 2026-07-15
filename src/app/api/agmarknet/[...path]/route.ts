import { NextRequest, NextResponse } from "next/server";
import { MandiRecord } from "@/types/mandi";

// "Current Daily Price of Various Commodities from Various Markets (Mandi)",
// Ministry of Agriculture and Farmers Welfare / data.gov.in.
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

/** API gives dates as dd/mm/yyyy - normalize to ISO yyyy-mm-dd. */
function toIsoDate(raw: string): string {
  const [dd, mm, yyyy] = raw.split("/");
  if (!dd || !mm || !yyyy) return raw;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function toNumber(raw: unknown): number {
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state")?.trim();
  const commodity = searchParams.get("commodity")?.trim();

  if (!state || !commodity) {
    return NextResponse.json(
      { error: "Both 'state' and 'commodity' query params are required." },
      { status: 400 }
    );
  }

  // Load the API key exclusively from the environment variables
  const apiKey = process.env.DATA_GOV_IN_API_KEY;

  // Fail safely if the environment variable is missing
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: API key missing." },
      { status: 500 }
    );
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "200");
  url.searchParams.set("filters[state]", state);
  url.searchParams.set("filters[commodity]", commodity);

  try {
    const res = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      // Current-day prices - avoid Next.js's default aggressive caching.
      cache: "no-store",
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "External API error", raw: errorBody, status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawRecords: any[] = Array.isArray(data.records) ? data.records : [];

    // The API can include nearby/other-state matches in some queries -
    // filter down to an exact (case-insensitive) match on the requested
    // state, since that's the whole point of the state filter.
    const records: MandiRecord[] = rawRecords
      .filter((r) => (r.state || "").trim().toLowerCase() === state.toLowerCase())
      .map((r) => ({
        state: r.state,
        district: r.district,
        market: r.market,
        commodity: r.commodity,
        variety: r.variety,
        grade: r.grade,
        arrivalDate: toIsoDate(r.arrival_date),
        minPrice: toNumber(r.min_price),
        maxPrice: toNumber(r.max_price),
        modalPrice: toNumber(r.modal_price),
      }));

    return NextResponse.json({
      records,
      count: records.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch mandi prices" },
      { status: 500 }
    );
  }
}