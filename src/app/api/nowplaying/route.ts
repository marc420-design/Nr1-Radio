import { NextResponse } from "next/server";
import { AZURACAST_BASE_URL as BASE_URL, STATION_ID } from "@/lib/constants";

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
