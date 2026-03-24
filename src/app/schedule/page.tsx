import type { Metadata } from "next";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { ScheduleRow } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Schedule — NR1 DNB Radio",
  description: "Weekly drum & bass show schedule for NR1 DNB Radio. Live Friday sessions, guest mixes, and 24/7 DNB from Norwich.",
};

export const revalidate = 300;

export default async function SchedulePage() {
  let schedule: ScheduleRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("schedule")
      .select("*")
      .order("day_of_week")
      .order("start_time");
    schedule = (data as ScheduleRow[]) ?? [];
  } catch {
    // Supabase not configured yet — show empty state
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="section-heading-rule">
          <h1 className="font-heading text-5xl sm:text-6xl text-white tracking-wide">Schedule</h1>
        </div>
        <p className="font-mono text-sm text-nr1-muted mt-2">
          Weekly show guide · All times UK local
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: "Live Show", cls: "border-nr1-crimson/40 bg-nr1-crimson/10 text-nr1-crimson" },
          { label: "Guest Mix", cls: "border-nr1-cyan/30 bg-nr1-cyan/5 text-nr1-cyan" },
          { label: "Replay", cls: "border-white/10 bg-white/5 text-white/50" },
          { label: "Special", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
        ].map(({ label, cls }) => (
          <span key={label} className={`px-3 py-1 rounded-full border text-xs font-mono ${cls}`}>
            {label}
          </span>
        ))}
      </div>

      <ScheduleGrid schedule={schedule} />
    </div>
  );
}
