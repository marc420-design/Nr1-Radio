"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScheduleRow } from "@/lib/supabase";
import { addCalendarDays, getNextScheduledShow, formatScheduleTime, londonDate, londonStart } from "@/lib/schedule";
import { programmeYear } from "@/lib/programming";
import programmePlan from "@/data/year-programming.json";

interface NextShowBannerProps {
  schedule: ScheduleRow[];
}

interface NextShow {
  show: ScheduleRow;
  startsAt: Date;
}


function formatCountdown(ms: number): string {
  if (ms <= 0) return "Starting now";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function NextShowBanner({ schedule }: NextShowBannerProps) {
  const [nextShow, setNextShow] = useState<NextShow | null>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    function update() {
      let show = getNextScheduledShow(schedule);
      if (!show) {
        const tomorrow = addCalendarDays(londonDate(), 1);
        const date = tomorrow < programmePlan.startDate ? programmePlan.startDate : tomorrow;
        const year = programmeYear(date);
        if (year) show = {
          show: { id: `archive-${date}`, show_name: year === 2026 ? "2026 Weekend" : `${year} Archive`, dj_name: null, day_of_week: (new Date(date + "T12:00:00Z").getUTCDay() + 6) % 7, start_time: "00:00:00", end_time: "23:59:00", show_type: "replay", created_at: "" },
          startsAt: londonStart(date, "00:00:00"),
        };
      }
      setNextShow(show);
      if (show) {
        setCountdown(formatCountdown(show.startsAt.getTime() - Date.now()));
      }
    }

    update();
    const interval = setInterval(update, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [schedule]);

  if (!nextShow) return null;

  const { show } = nextShow;
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayLabel = DAYS[show.day_of_week] ?? "";
  const timeLabel = formatScheduleTime(show.start_time);

  return (
    <Link
      href="/schedule"
      className="flex items-center justify-between gap-4 w-full max-w-md mx-auto px-4 py-3 rounded-xl border border-nr1-cyan/20 bg-nr1-cyan/5 hover:border-nr1-cyan/40 hover:bg-nr1-cyan/10 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-2 h-2 rounded-full bg-nr1-cyan shrink-0 animate-pulse" />
        <div className="min-w-0">
          <p className="text-xs font-mono text-nr1-muted uppercase tracking-widest">Next programme</p>
          <p className="text-sm font-heading text-white truncate">{show.show_name}</p>
          {show.dj_name && (
            <p className="text-xs font-mono text-nr1-cyan truncate">{show.dj_name}</p>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-heading text-nr1-cyan leading-none">{countdown}</p>
        <p className="text-[10px] font-mono text-nr1-muted mt-0.5">{dayLabel} · {timeLabel}</p>
      </div>
    </Link>
  );
}
