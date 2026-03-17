import { NextResponse } from "next/server";
import { AZURACAST_BASE_URL as BASE_URL, STATION_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

// AzuraCast returns location.country as an ISO 3166-1 alpha-2 code (e.g. "GB"),
// not a full country name. location.country_code does not exist in the response.
interface AzuraListener {
  location?: {
    city?: string;
    country?: string;    // ISO code e.g. "GB"
    region?: string;
    description?: string;
    lat?: number;
    lon?: number;
  };
}

// Map ISO codes to display names for the most common listener countries.
// Falls back to the code itself for unlisted ones.
const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom", US: "United States", IE: "Ireland",
  DE: "Germany", FR: "France", NL: "Netherlands", AU: "Australia",
  CA: "Canada", NZ: "New Zealand", BE: "Belgium", SE: "Sweden",
  NO: "Norway", DK: "Denmark", FI: "Finland", ES: "Spain",
  IT: "Italy", PT: "Portugal", PL: "Poland", CZ: "Czech Republic",
  AT: "Austria", CH: "Switzerland", ZA: "South Africa", JP: "Japan",
  BR: "Brazil", MX: "Mexico", IN: "India", SG: "Singapore",
  HK: "Hong Kong", MY: "Malaysia", TH: "Thailand", NG: "Nigeria",
  KE: "Kenya", GH: "Ghana", JM: "Jamaica", TT: "Trinidad and Tobago",
};

export async function GET() {
  const apiKey = process.env.AZURACAST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ total: 0, byCountry: [], byCity: [] });
  }

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
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
      // AzuraCast returns the ISO code in location.country (e.g. "GB")
      const code = listener.location?.country?.toUpperCase() ?? "";
      const countryName = (code && COUNTRY_NAMES[code]) ? COUNTRY_NAMES[code] : (code || "Unknown");

      const existing = byCountryCounts.get(countryName);
      byCountryCounts.set(countryName, { count: (existing?.count ?? 0) + 1, code });

      const cityRaw = listener.location?.city?.trim();
      if (cityRaw) {
        const cityKey = `${cityRaw}||${countryName}`;
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

    return NextResponse.json({ total: data.length, byCountry, byCity });
  } catch {
    return NextResponse.json({ total: 0, byCountry: [], byCity: [] }, { status: 503 });
  }
}
