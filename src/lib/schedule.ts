import type { ScheduleRow } from "@/lib/supabase";
export const SCHEDULE_ZONE = "Europe/London";
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export function londonDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SCHEDULE_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function addCalendarDays(date: string, days: number): string {
  const value = new Date(date + "T12:00:00Z"); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10);
}
export function weekMonday(now = new Date()): string {
  const date = londonDate(now); const day = new Date(date + "T12:00:00Z").getUTCDay(); return addCalendarDays(date, -((day + 6) % 7));
}
export function isContinuousRotation(show: ScheduleRow): boolean { return /7\s*day\s*all|archive rotation/i.test(show.show_name); }
export function formatScheduleTime(time: string): string { return time.slice(0, 5); }
export function londonStart(date: string, time: string): Date {
  const target = Date.parse(date + "T" + time.slice(0, 5) + ":00Z"); let timestamp = target;
  const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: SCHEDULE_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(timestamp)).map(p => [p.type, p.value]));
    const wall = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second)); timestamp += target - wall;
  }
  return new Date(timestamp);
}
export function getNextScheduledShow(schedule: ScheduleRow[], now = new Date()): { show: ScheduleRow; startsAt: Date } | null {
  const monday = weekMonday(now);
  const candidates = schedule.filter(s => !isContinuousRotation(s)).flatMap(show => [0, 7, 14].map(offset => ({ show, startsAt: londonStart(addCalendarDays(monday, show.day_of_week + offset), show.start_time) })))
    .filter(s => s.startsAt.getTime() > now.getTime()).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()); return candidates[0] ?? null;
}
