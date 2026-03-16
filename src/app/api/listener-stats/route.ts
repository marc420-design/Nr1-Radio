import { NextResponse } from "next/server";
import { AZURACAST_BASE_URL as BASE_URL, STATION_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface AzuraListener {
  location?: {
    city?: string;
    country?: string;
    country_code?: string;
  };
}

export async function GET() {
  const apiKey = process.env.AZURACAST_API_KEY;
  if (!apiKey) {
    // Fail soft if key not configured – just return empty stats
    return NextResponse.json({ total: 0, byCountry: [], byCity: [] });
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    // AzuraCast commonly supports X-API-Key for admin API access
    // but allow passing a full Authorization value if the user stores it that way.
    if (/^bearer\s/i.test(apiKey)) {
      headers.Authorization = apiKey;
    } else {
      headers["X-API-Key"] = apiKey;
    }

    const res = await fetch(`${BASE_URL}/api/station/${STATION_ID}/listeners`, {
      headers,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ total: 0, byCountry: [], byCity: [] }, { status: res.status });
    }

    const body = await res.json();
    const data = (Array.isArray(body) ? body : []) as AzuraListener[];

    const byCountryCounts = new Map<string, { count: number; code: string }>();
    const byCityCounts = new Map<string, number>();
    for (const listener of data) {
      const country =
        listener.location?.country ||
        listener.location?.country_code ||
        "Unknown";
      const code = listener.location?.country_code ?? "";
      const existing = byCountryCounts.get(country);
      byCountryCounts.set(country, { count: (existing?.count ?? 0) + 1, code });

      const cityRaw = listener.location?.city?.trim();
      if (cityRaw) {
        const cityKey = `${cityRaw}||${country}`;
        byCityCounts.set(cityKey, (byCityCounts.get(cityKey) ?? 0) + 1);
      }
    }

    const byCountry = Array.from(byCountryCounts.entries())
      .map(([country, { count, code }]) => ({ country, count, code }))
      .sort((a, b) => b.count - a.count);

    const byCity = Array.from(byCityCounts.entries())
      .map(([key, count]) => {
        const [city, country] = key.split("||");
        return { city, country, count };
      })
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      total: data.length,
      byCountry,
      byCity,
    });
  } catch {
    return NextResponse.json({ total: 0, byCountry: [], byCity: [] }, { status: 503 });
  }
}

