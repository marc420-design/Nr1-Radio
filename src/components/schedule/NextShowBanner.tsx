"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScheduleRow } from "@/lib/supabase";

interface NextShowBannerProps {
  schedule: ScheduleRow[];
}

interface NextShow {
  show: ScheduleRow;
  startsAt: Date;
}

/**
 * Finds the next upcoming show from the weekly schedule.
 * Times in the DB are stored as UK local time (Europe/London).
 * We compare against current UK time using the Intl API.
 */
function getNextShow(schedule: ScheduleRow[]): NextShow | null {
  if (!schedule.length) return null;

  const now = new Date();

  // Get current time in Europe/London
  const londonFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
    hour12: false,
  });
  const parts = londonFormatter.formatToParts(now);
  const londonWeekday = parts.find((p) => p.type === "weekday")?.value; // e.g. "Sat"
  const londonHour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const londonMinute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);

  const WEEKDAY_MAP: Record<string, number> = {
    Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
  };
  const currentDayIndex = WEEKDAY_MAP[londonWeekday ?? "Mon"] ?? 0;
  const currentMinutesInWeek = currentDayIndex * 1440 + londonHour * 60 + londonMinute;

  // Convert each show to minutes-in-week
  const showsWithMinutes = schedule.map((show) => {
    const [h, m] = show.start_time.split(":").map(Number);
    const minutesInWeek = show.day_of_week * 1440 + h * 60 + m;
    return { show, minutesInWeek };
  });

  // Find the next show after now (or wrap around to next week)
  const upcoming = showsWithMinutes
    .filter((s) => s.minutesInWeek > currentMinutesInWeek)
    .sort((a, b) => a.minutesInWeek - b.minutesInWeek);

  const next = upcoming[0] ?? showsWithMinutes.sort((a, b) => a.minutesInWeek - b.minutesInWeek)[0];
  if (!next) return null;

  // Calculate actual Date when the show starts
  let minutesUntil = next.minutesInWeek - currentMinutesInWeek;
  if (minutesUntil <= 0) minutesUntil += 7 * 1440; // wrap to next week

  const startsAt = new Date(now.getTime() + minutesUntil * 60 * 1000);
  return { show: next.show, startsAt };
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
      const show = getNextShow(schedule);
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
  const [h, m] = show.start_time.split(":").map(Number);
  const hour = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  const timeLabel = `${hour}:${String(m).padStart(2, "0")} ${ampm}`;

  return (
    <Link
      href="/schedule"
      className="flex items-center justify-between gap-4 w-full max-w-md mx-auto px-4 py-3 rounded-xl border border-nr1-cyan/20 bg-nr1-cyan/5 hover:border-nr1-cyan/40 hover:bg-nr1-cyan/10 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-2 h-2 rounded-full bg-nr1-cyan shrink-0 animate-pulse" />
        <div className="min-w-0">
          <p className="text-xs font-mono text-nr1-muted uppercase tracking-widest">Next show</p>
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
