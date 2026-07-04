import { NextResponse, type NextRequest } from "next/server";
import { fetchAndUpsertHistory } from "@/lib/azuracast-history";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setUTCHours(23, 59, 59, 999);

  try {
    const result = await fetchAndUpsertHistory(yesterday.toISOString(), endOfYesterday.toISOString());
    return NextResponse.json({
      date: yesterday.toISOString().slice(0, 10),
      ...result,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
