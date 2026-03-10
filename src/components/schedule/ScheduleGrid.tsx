import type { ScheduleRow } from "@/lib/supabase";

interface ScheduleGridProps {
  schedule: ScheduleRow[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SHOW_TYPE_STYLES: Record<string, string> = {
  live: "border-nr1-crimson/40 bg-nr1-crimson/10",
  replay: "border-white/10 bg-white/5",
  guest: "border-nr1-cyan/30 bg-nr1-cyan/5",
  special: "border-amber-500/40 bg-amber-500/10",
};

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

export function ScheduleGrid({ schedule }: ScheduleGridProps) {
  if (!schedule.length) {
    return (
      <div className="text-center py-20 text-nr1-muted font-mono">
        <p>Schedule coming soon.</p>
        <p className="text-sm mt-2 text-nr1-muted/60">Check back or follow us for updates.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
      {DAYS.map((day, dayIndex) => {
        const dayShows = schedule
          .filter((s) => s.day_of_week === dayIndex)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));

        return (
          <div key={day} className="space-y-2">
            <h3 className="text-xs font-mono text-nr1-cyan uppercase tracking-widest pb-2 border-b border-white/10">
              {day}
            </h3>
            {dayShows.length === 0 ? (
              <p className="text-xs text-nr1-muted/40 font-mono py-2">—</p>
            ) : (
              dayShows.map((show) => (
                <div
                  key={show.id}
                  className={`rounded-lg border p-3 ${SHOW_TYPE_STYLES[show.show_type] ?? SHOW_TYPE_STYLES.live}`}
                >
                  <p className="text-xs font-mono text-nr1-muted">
                    {formatTime(show.start_time)} – {formatTime(show.end_time)}
                  </p>
                  <p className="text-sm font-body text-white mt-0.5">{show.show_name}</p>
                  {show.dj_name && (
                    <p className="text-xs font-mono text-nr1-cyan mt-0.5">{show.dj_name}</p>
                  )}
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
