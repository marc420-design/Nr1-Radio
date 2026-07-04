import { NextResponse, type NextRequest } from "next/server";
import { fetchAndUpsertHistory } from "@/lib/azuracast-history";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin_token")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const startStr = typeof body.start === "string" ? body.start : null;
  const endStr = typeof body.end === "string" ? body.end : null;
  if (!startStr || !endStr) {
    return NextResponse.json({ error: "start and end (YYYY-MM-DD) required" }, { status: 400 });
  }

  const start = new Date(`${startStr}T00:00:00Z`);
  const end = new Date(`${endStr}T23:59:59Z`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const days: { date: string; fetched: number; inserted: number; error?: string }[] = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    const dayStart = new Date(cursor);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(cursor);
    dayEnd.setUTCHours(23, 59, 59, 999);
    const dateStr = dayStart.toISOString().slice(0, 10);

    try {
      const result = await fetchAndUpsertHistory(dayStart.toISOString(), dayEnd.toISOString());
      days.push({ date: dateStr, ...result });
    } catch (err) {
      days.push({ date: dateStr, fetched: 0, inserted: 0, error: (err as Error).message });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const totals = days.reduce(
    (acc, d) => ({ fetched: acc.fetched + d.fetched, inserted: acc.inserted + d.inserted }),
    { fetched: 0, inserted: 0 }
  );

  return NextResponse.json({ ...totals, days });
}
