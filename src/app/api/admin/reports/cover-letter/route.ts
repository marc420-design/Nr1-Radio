import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { STATION_META } from "@/lib/station";

export const dynamic = "force-dynamic";

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin_token")?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  if (!fromStr || !toStr) {
    return NextResponse.json({ error: "from and to (YYYY-MM-DD) required" }, { status: 400 });
  }

  const fromIso = new Date(`${fromStr}T00:00:00Z`).toISOString();
  const toIso = new Date(`${toStr}T23:59:59Z`).toISOString();

  const supabase = getSupabaseAdminClient();
  const { count } = await supabase
    .from("play_history")
    .select("id", { count: "exact", head: true })
    .gte("played_at", fromIso)
    .lte("played_at", toIso);

  const today = new Date().toISOString().slice(0, 10);
  const rowCount = count ?? 0;

  const letter = `${today}

To: PRS for Music / PPL — Broadcast Reporting

Subject: Broadcast Reporting Return — ${STATION_META.name} (${STATION_META.shortName})
Reporting period: ${fromStr} to ${toStr}

Dear Sir/Madam,

Please find attached the broadcast reporting return for ${STATION_META.name},
covering the period ${fromStr} to ${toStr} inclusive.

Station details
---------------
Name:            ${STATION_META.name}
Short name:      ${STATION_META.shortName}
Website:         ${STATION_META.siteUrl}
Broadcaster:     ${STATION_META.name}, ${STATION_META.city}, ${STATION_META.country}
Operator email:  ${STATION_META.social.email}
Founded:         ${STATION_META.founded}
Genre:           Drum & Bass (specialist music radio, 24/7 online broadcast)

Reporting notes
---------------
${rowCount.toLocaleString()} broadcast entries are included in the attached CSV
(nr1-dnb-cue-sheet_${fromStr}_${toStr}.csv).

The vast majority of our output consists of continuous DJ mixes and live sets
recorded by resident and guest DJs. In each case, the audio broadcast is a
single continuous mix file — the individual tracks played within the mix by the
DJ are not separately catalogued in our broadcast automation (AzuraCast) and
are not identifiable from playout metadata alone.

Where a row in the attached CSV represents a DJ mix or live set, the Notes
column has been populated accordingly, and the Track Title / Artist reflect the
mix / set name and its performing DJ (not the individual tracks contained
within the mix). Duration reflects the full mix duration as broadcast.

We are happy to provide any additional information required, and to work with
PRS / PPL to agree an appropriate reporting methodology for continuous DJ-mix
programming should this be preferred.

Yours faithfully,

${STATION_META.name}
${STATION_META.social.email}
${STATION_META.siteUrl}
`;

  const filename = `nr1-dnb-cover-letter_${fromStr}_${toStr}.txt`;
  return new NextResponse(letter, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
