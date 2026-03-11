import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL ?? "http://radio.listen-nr1dnb.com";
const STATION_ID = process.env.NEXT_PUBLIC_STATION_ID ?? "nr1_dnb_radio";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/api/nowplaying/${STATION_ID}`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "upstream error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "unreachable" }, { status: 503 });
  }
}
