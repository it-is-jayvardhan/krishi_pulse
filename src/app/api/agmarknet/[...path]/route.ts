import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.ceda.ashoka.edu.in/v1/agmarknet";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const targetUrl = `${BASE_URL}/${resolvedParams.path.join("/")}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${process.env.CEDA_API_TOKEN}`,
        accept: "application/json",
      },
    });

    // If the API returns a bad status (like 429 or 500), read its error body and pass it along
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.message || "External API Error", 
          raw: errorData,
          status: res.status 
        }, 
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch GET" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const targetUrl = `${BASE_URL}/${resolvedParams.path.join("/")}`;
  const body = await request.json();

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CEDA_API_TOKEN}`,
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.message || "External API Error", 
          raw: errorData,
          status: res.status 
        }, 
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch POST" }, { status: 500 });
  }
}