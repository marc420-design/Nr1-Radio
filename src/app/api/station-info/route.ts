import { NextResponse } from "next/server";
import { STATION_META } from "@/lib/station";

// Statically generated — data only changes on redeploy
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(STATION_META, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
